import { Plugin, Modal } from 'obsidian';
import React, { StrictMode } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { ReactView } from './ReactView';

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

export default class ThecapCvGenerator extends Plugin {
	async onload() {
		this.addRibbonIcon('pdf-file', 'Preview curriculum', () => {
			new CvModal(this.app).open();
		});

		this.addCommand({
			id: 'thecap-cv-generator-preview',
			name: 'Open curriculum preview',
			callback: () => {
				new CvModal(this.app).open();
			}
		});
	}

	onunload() {

	}
}
