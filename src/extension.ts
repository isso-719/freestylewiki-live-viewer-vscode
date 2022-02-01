import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('FS-Live-Viewer.open', () => {

		const panel = vscode.window.createWebviewPanel(
			'FS-Live-Viewer', // Identifies the type of the webview. Used internally
			'FS Live Viewer', // Title of the panel displayed to the user
			vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
			{
				enableScripts: true,
			}
		);

		// アクティブなウィンドウのタブを取得
		const activeEditor = vscode.window.activeTextEditor;

		// アクティブなウィンドウのタブが存在しない場合は終了
		if (!activeEditor) {
			vscode.window.showErrorMessage('No active editor.');
			return;
		}

		// アクティブなウィンドウのタブのファイルパスを取得
		const filePath = activeEditor.document.fileName;

		// アクティブなウィンドウのタブがファイルでない場合は終了
		if (!filePath) {
			vscode.window.showErrorMessage('No active file.');
			return;
		}

		const cssFile = vscode.Uri.file(path.join(context.extensionPath, 'src', 'content', 'style.css'));
		const jsFile = vscode.Uri.file(path.join(context.extensionPath, 'src', 'content', 'main.js'));

		const cssPath = panel.webview.asWebviewUri(cssFile);
		const jsPath = panel.webview.asWebviewUri(jsFile);

		// アクティブなウィンドウのタブのファイルのコードを取得
		let code = activeEditor.document.getText();

		panel.webview.html = getWebviewContent(cssPath, jsPath, code);

		// アクティブなウィンドウのタブのファイルのコードを変更した際に、Webviewに反映させる
		vscode.workspace.onDidChangeTextDocument(() => {
			code = activeEditor.document.getText();
			panel.webview.html = getWebviewContent(cssPath, jsPath, code);
		});

	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}

function getWebviewContent(cssPath: vscode.Uri, jsPath: vscode.Uri, code: string) {
	return `<!DOCTYPE html>
<html lang="ja">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" href="${cssPath}">
	<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
	<script src="https://unpkg.com/monaco-editor@latest/min/vs/loader.js"></script>
	<title>FS Wiki Live Viewer</title>
</head>

<body>
	<div id="container"></div>
	<script>var code = ${JSON.stringify(code)};</script>
	<script src="${jsPath}"></script>
</body>

</html>`;
}