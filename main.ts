import { App, Plugin, PluginSettingTab, Setting, Modal } from 'obsidian';
import React, { StrictMode } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { ReactView } from './ReactView';

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

class CvModal extends Modal {
	root: Root | null = null;

	async getCurrentMarkdown(): Promise<string> {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) return '';
		
		const content = await this.app.vault.cachedRead(activeFile);
		return content;
	}

	async onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('cv-preview-modal');
		
		// Create container for React
		const reactContainer = contentEl.createDiv();
		this.root = createRoot(reactContainer);

		const markdown = await this.getCurrentMarkdown();
		this.root.render(
			React.createElement(StrictMode, null,
				React.createElement(ReactView, { markdown })
			)
		);
	}

	onClose() {
		this.root?.unmount();
		const { contentEl } = this;
		contentEl.empty();
	}
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// Add a ribbon icon to open the modal
		this.addRibbonIcon('pdf-file', 'Preview CV', () => {
			new CvModal(this.app).open();
		});

		// Add command to open CV preview
		this.addCommand({
			id: 'open-cv-preview',
			name: 'Open CV Preview',
			callback: () => {
				new CvModal(this.app).open();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
