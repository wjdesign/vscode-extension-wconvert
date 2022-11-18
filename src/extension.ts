// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "wconvert" is now active!');

	const input = async (placeHolder: string) => await vscode.window.showInputBox({
		placeHolder
	}) || '';

	function pad(num: string | number, size: number): string {
		num = num.toString();
		while (num.length < size) {
			num = "0" + num;
		}
		return num;
	}

	// 於 vscode Information Window 顯示時間戳
	function showTimestamp(datetime: string) {
		let timestamp: number | undefined = NaN;
		try {
			timestamp = new Date(datetime).getTime();
			if (typeof timestamp !== "number" || isNaN(timestamp) || timestamp.toString() === "NaN") {
				return askDateTime();
			};
			vscode.window.showInformationMessage(timestamp.toString());
		} catch(e) {
			console.log(e);
			vscode.window.showErrorMessage("Invalid Date.");
			askDateTime();
		}
	}

	// 詢問 DateTime 輸入框
	async function askDateTime() {
		const fullDateTime = await input("DateTime (format: YYYY-MM-DD hh:mm:ss.ms) (example: 2022-12-31 23:59:59.999)：");
		if (fullDateTime) {
			showTimestamp(fullDateTime);
		}
	}

	// function genTimestamp(datetime: string) {
	// 	let timestamp: number | undefined = NaN;
	// 	try {
	// 		timestamp = new Date(datetime).getTime();
	// 		if (typeof timestamp !== "number" || isNaN(timestamp) || timestamp.toString() === "NaN") {
	// 			return askDateTime();
	// 		};
	// 		return timestamp;
	// 	} catch(e) {
	// 		vscode.window.showErrorMessage("Invalid Date.");
	// 		askDateTime();
	// 	}
	// }

	// 於指標處插入產生的時間戳
	vscode.commands.registerTextEditorCommand("wconvert.genTimestamp", async (editor, edit) => {
		const fullDateTime = await input("DateTime (format: YYYY-MM-DD hh:mm:ss.ms) (example: 2022-12-31 23:59:59.999)：");
		if (!fullDateTime) {
			return;
		}

		try {
			let timestamp = new Date(fullDateTime).getTime();
			if (!isNaN(timestamp) && typeof timestamp === "number" && timestamp.toString() !== "NaN") {
				// editor.edit((editBuilder) => {
				// 	editBuilder.insert(editor.selection.active, timestamp.toString());
				// });

				editor.edit((editBuilder) => {
					editor.selections.forEach((selectionItem, i) => {
						editBuilder.insert(selectionItem.active, timestamp.toString());
					});
				});
			} else {
				vscode.window.showErrorMessage("Datetime convert failed.");
			}
		} catch(e) {
			vscode.window.showErrorMessage("Invalid Date.");
		}
	});

	// 只顯示產生的時間戳
	let generateTimestamp = vscode.commands.registerCommand("wconvert.genTimestampJustShow", askDateTime);

	// 將選取的時間戳轉換成 YYYY-MM-DD HH:mm:ss
	let timestamp2DateTime = vscode.commands.registerTextEditorCommand("wconvert.timestamp2dateTime", async (editor, edit) => {
		// const selectionCode = editor.selection;
		// const selection = editor.document.getText(selectionCode);
		// edit.replace(selectionCode, fullDateTime);

		const offsetStr = await input("Time zone (example: +8)：");
		const offset = Number(offsetStr);

		editor.edit((editBuilder) => {
			editor.selections.forEach((selectionItem, i) => {
				try {
					const selection = editor.document.getText(selectionItem);
					let dateArr = new Date(parseInt(selection) - (-offset * 60 * 60 * 1000)).toISOString().split("T");
					const [YYYYMMDD, hhmmss] = dateArr;
					const [year, month, day] = YYYYMMDD.split("-");
					const [hour, minute, fullSecond] = hhmmss.split(":");
					const [second, millionSecondZ] = fullSecond.split(".");
					const millionSecond = millionSecondZ.replace("Z", "");

					let fullDateTime = `"${year}-${pad(month, 2)}-${pad(day, 2)} ${pad(hour, 2)}:${pad(minute, 2)}:${pad(second, 2)}.${pad(millionSecond, 3)}"`;
					
					// edit.replace(selectionItem, fullDateTime);
					editBuilder.replace(selectionItem, fullDateTime);
				} catch (e) {
					console.log(e);
					vscode.window.showErrorMessage("Invalid Date.");
				}
			});
		});
	});

	context.subscriptions.push(timestamp2DateTime, generateTimestamp);
}

// This method is called when your extension is deactivated
export function deactivate() {}
