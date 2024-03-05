import * as vscode from 'vscode';
import * as path from 'path';
import HTMLParse from './lib/parser';

let lastKnownScrollY = 0;
let panel: vscode.WebviewPanel | null = null;

export function activate(context: vscode.ExtensionContext) {
	let panelGen = vscode.commands.registerCommand('fs-live-viewer.open', () => {

		const activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			vscode.window.showErrorMessage('No active editor.');
			return;
		}

		const activeFile = activeEditor.document.fileName;
		if (!activeFile) {
			vscode.window.showErrorMessage('No active file.');
			return;
		}

		if (!activeFile.endsWith('.fsw') && !activeFile.endsWith('.fswiki')) {
			vscode.window.showErrorMessage('This file is not a FreeStyleWiki file.');
			return;
		}

		panel = vscode.window.createWebviewPanel(
			'fs-live-viewer',
			'FreeStyleWiki Live Viewer',
			vscode.ViewColumn.Beside,
			{
				enableScripts: true,
				retainContextWhenHidden: true,
			}
		);


		const config = vscode.workspace.getConfiguration("fs-live-viewer");
		const styleTheme: any = config.get("styleTheme");

		const cssFile = vscode.Uri.file(path.join(context.extensionPath, 'dist', 'theme', `${styleTheme}`, `${styleTheme}.css`));
		const cssPath = panel.webview.asWebviewUri(cssFile);

		panel.webview.html = getWebviewContent(HTMLParse(activeEditor.document.getText()), cssPath);

		vscode.workspace.onDidChangeTextDocument(event => {
			if (activeEditor && event.document === activeEditor.document && panel) {
				panel.webview.html = getWebviewContent(HTMLParse(activeEditor.document.getText()), cssPath);
				panel.webview.postMessage({ command: 'getScrollPosition' });
			}
		});

		panel.webview.onDidReceiveMessage(message => {
			switch (message.command) {
				case 'saveScrollPosition':
					lastKnownScrollY = message.scrollY;
					break;
			}
		});
	});

	context.subscriptions.push(panelGen);
}

function getWebviewContent(text: string, cssPath: vscode.Uri): string {
	return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<meta charset="UTF-8">
			<link rel="stylesheet" href="${cssPath}">
		<body>
			${text}
			<div style="height: calc(100vh - 1em);"></div>

			<script>
				window.onload = () => {
					window.scrollTo(0, ${lastKnownScrollY});
				};

				const vscode = acquireVsCodeApi()
				window.onscroll = () => {
					vscode.postMessage({
						command: 'saveScrollPosition',
						scrollY: window.scrollY
					});
				};

				window.addEventListener('message', event => {
					const message = event.data;
					switch (message.command) {
						case 'getScrollPosition':
							vscode.postMessage({
								command: 'saveScrollPosition',
								scrollY: window.scrollY
							});
							break;
					}
				});
			</script>
		</body>
		</html>`;
}
