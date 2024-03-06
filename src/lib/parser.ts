import { get } from 'http';
import * as vscode from 'vscode';

function HTMLParse(text: string): string {

    // <, > をエスケープ
    text = text.replace(/</g, "&lt;"); // <
    text = text.replace(/>/g, "&gt;"); // >

    // \r\n となっている場合は \n に変換 (改行コードの統一)
    text = text.replace(/\r\n/g, "\n");

    // vscode から plugin 設定を取得
    const config = vscode.workspace.getConfiguration("fs-live-viewer");
    const pluginSettings: any = config.get("pluginParseSettings");

    // テキストを \n で分割
    const lines = text.split("\n");

    // 結果を格納する変数
    let result = [];

    for (let i = 0; i < lines.length; i++) {
        // エスケープ
        lines[i] = lines[i].replace(/</g, "&lt;"); // <
        lines[i] = lines[i].replace(/>/g, "&gt;"); // >

        // 空行
        if (lines[i] === "") {
            result.push("<div></div>");
            continue;
        }

        // ブロック書式のエスケープ
        if (lines[i].startsWith("\\")) {
            result.push(`<!-- ${lines[i].slice(1)} -->`);
            continue;
        }

        // パラグラフプラグイン
        if (lines[i].startsWith("{{")) {
            // lines[i] が終わるか、}} が見つかるまでループ
            let paragraph = lines[i] + "\n";
            const plugin = getPluginFromText(paragraph);

            i++;
            while (i < lines.length) {
                if (paragraph.includes("}}")) {
                    break;
                }
                paragraph += lines[i];
                paragraph += "\n";
                i++;
            }

            let pluginHTMLPattern = "";
            let pluginFSWPattern = "";

            for (let j = 0; j < pluginSettings.length; j++) {
                if (plugin === getPluginFromText(pluginSettings[j].parseFSWTemplate)) {
                    pluginHTMLPattern = pluginSettings[j].parseHTMLTemplate;
                    pluginFSWPattern = pluginSettings[j].parseFSWTemplate;
                    break;
                }
            }

            if (pluginHTMLPattern === "") {
                result.push(`<p>${paragraph}</p>`);
                continue;
            }

            pluginFSWPattern = pluginFSWPattern.replace(/\$(\d+)/g, '(.*)');

            const regex = new RegExp(pluginFSWPattern, "s");
            const match = paragraph.match(regex);
            if (match) {
                let html = pluginHTMLPattern;
                for (let j = 1; j < match.length; j++) {
                    html = html.replace(new RegExp(`\\$${j}`, "g"), match[j]);
                }
                result.push(html);
            } else {
                result.push(`<p>${paragraph}</p>`);
            }
            continue;
        }

        // PRE
        if (lines[i].startsWith(" ") || lines[i].startsWith("\t")) {
            let pre = "<pre>";
            pre += lines[i];
            i++;
            while (i < lines.length) {
                if (!lines[i].startsWith(" ") && !lines[i].startsWith("\t")) {
                    break;
                }
                pre += "\n"+lines[i];
                i++;
            }
            pre += "</pre>";

            result.push(pre);
            continue;
        }

        // 見出し
        if (lines[i].startsWith("!!!")) {
            result.push(`<h2>${textDecolation(lines[i].slice(3))}</h2>`);
            continue;
        } else if (lines[i].startsWith("!!")) {
            result.push(`<h3>${textDecolation(lines[i].slice(2))}</h3>`);
            continue;
        } else if (lines[i].startsWith("!")) {
            result.push(`<h4>${textDecolation(lines[i].slice(1))}</h4>`);
            continue;
        }

        // 項目
        if (lines[i].startsWith("***")) {
            result.push(`<li style="margin-left: 20px;">${textDecolation(lines[i].slice(3))}</li>`);
            continue;
        } else if (lines[i].startsWith("**")) {
            result.push(`<li style="margin-left: 10px;">${textDecolation(lines[i].slice(2))}</li>`);
            continue;
        } else if (lines[i].startsWith("*")) {
            result.push(`<li>${textDecolation(lines[i].slice(1))}</li>`);
            continue;
        }

        // 番号付き項目
        if (lines[i].startsWith("+++")) {
            result.push(`<li style="margin-left: 20px;">${textDecolation(lines[i].slice(3))}</li>`);
            continue;
        } else if (lines[i].startsWith("++")) {
            result.push(`<li style="margin-left: 10px;">${textDecolation(lines[i].slice(2))}</li>`);
            continue;
        } else if (lines[i].startsWith("+")) {
            result.push(`<li>${textDecolation(lines[i].slice(1))}</li>`);
            continue;
        }

        // 水平線
        if (lines[i] === "----") {
            result.push("<hr>");
            continue;
        }

        // 引用
        if (lines[i].startsWith('""')) {
            let quote = "<blockquote>";
            quote += "<p>" + textDecolation(lines[i].slice(2)) + "</p>";
            i++;
            while (i < lines.length) {
                if (!lines[i].startsWith('""')) {
                    break;
                }
                quote += "<p>" + textDecolation(lines[i].slice(2)) + "</p>";
                i++;
            }
            quote += "</blockquote>";

            result.push(quote);
            continue;
        }

        // 説明
        // :: で始まる行複数行
        if (lines[i].startsWith("::")) {
            let description = "<dl>";
            description += `<dt>${lines[i].slice(2)}</dt>`;
            i++;
            while (i < lines.length) {
                if (!lines[i].startsWith("::")) {
                    break;
                }
                // 先頭の :: を削除
                description += `<dd>${lines[i].slice(3)}</dd>`;
                i++;
            }
            description += "</dl>";

            result.push(description);
            continue;
        }
        // : で始まる行は :項目:説明文 として処理
        if (lines[i].startsWith(":")) {
            const description = lines[i].split(":");
            result.push(`<dl><dt>${description[1]}</dt><dd>${description[2]}</dd></dl>`);
            continue;
        }

        // テーブル
        if (lines[i].startsWith(",")) {
            let table = "<table><tbody>";
            table += "<tr>";
            const th = lines[i].split(",");
            for (let j = 1; j < th.length; j++) {
                table += `<th>${th[j]}</th>`;
            }
            table += "</tr>";
            i++;
            while (i < lines.length) {
                if (!lines[i].startsWith(",")) {
                    break;
                }
                table += "<tr>";
                const td = lines[i].split(",");
                for (let j = 1; j < td.length; j++) {
                    table += `<td>${td[j]}</td>`;
                }
                table += "</tr>";
                i++;
            }
            table += "</tbody></table>";

            result.push(table);
            continue;
        }

        // コメント
        if (lines[i].startsWith("//")) {
            continue;
        }

        // その他
        result.push(`${textDecolation(lines[i])}`);
    }

    return result.join("\n");
}

function getPluginFromText(text: string): string {
    let plugin = "";
    for (let i = 0; i <= text.length; i++) {
        if (text[i] === " " || text[i] === "\n" || (text[i] === "}" && text[i + 1] === "}")) {
            break;
        }
        plugin += text[i];
    }


    return plugin;
}

function textDecolation(text: string): string {
    // link
    text = text.replace(/\[\[(.*?)\|(.*?)\]\]/g, '<a href="$2">$1</a>');
    text = text.replace(/\[(.*?)\|(.*?)\]/g, function (_, text, url) {
        url = url.replace(/^https?:\/\//, '');
        return '<a href="' + url + '">' + text + '</a>';
    });
    text = text.replace(/\[\[(.*?)\]\]/g, '<a href="$1">$1</a>');
    text = text.replace(/(https?:\/\/[^\s]+)/g, function (url) {
        url = url.replace(/^https?:\/\//, '');
        return '<a href="' + url + '">' + url + '</a>';
    });

    // text decoration
    text = text.replace(/'''(.*?)'''/g, '<strong>$1</strong>');
    text = text.replace(/''(.*?)''/g, '<em>$1</em>');
    text = text.replace(/==(.*?)==/g, '<del>$1</del>');
    text = text.replace(/__(.*?)__/g, '<ins>$1</ins>');

    return text;
}

export default HTMLParse;
