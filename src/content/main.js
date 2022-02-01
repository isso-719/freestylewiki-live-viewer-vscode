// 変換後の文字列
var result = ``;

// ターゲットを変換する
function convert(target) {
    // 複数行からなる target を1行ずつに分割
    var lines = target.split(/\r\n|\r|\n/);
    var is_ul1 = false;
    var is_ul2 = false;
    var is_ul3 = false;
    var is_ol1 = false;
    var is_ol2 = false;
    var is_ol3 = false;
    var is_table = false;
    var is_th = false;
    var is_pre = false;

    // 1行ずつ変換
    for (var i = 0; i < lines.length; i++) {
        // 変換後の文字列を格納する変数
        var line = lines[i];

        // line をエスケープ
        line = line.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // 行の開始が {{pre ならばpre
        if (line == "{{pre") {
            line = `<pre>`;
            result += line;
            is_pre = true;
            continue;
        }

        // 行の開始が }} ならば/pre
        if (line == "}}") {
            line = `</pre>`;
            result += line;
            is_pre = false;
            continue;
        }

        // is_pre が true の場合は、改行してlineを追加
        if (is_pre) {
            result += `\n${line}`;
            continue;
        }

        // !!!から始まればh2
        // !!から始まればh3
        // !から始まればh4
        if (line.match(/^!!!/)) {
            line = `<h2>${line.replace(/^!!!/, "")}</h2>`;
            result += line;
            continue;
        } else if (line.match(/^!!/)) {
            line = `<h3>${line.replace(/^!!/, "")}</h3>`;
            result += line;
            continue;
        } else if (line.match(/^!/)) {
            line = `<h4>${line.replace(/^!/, "")}</h4>`;
            result += line;
            continue;
        }

        // ""のみから始まれば引用
        if (line.match(/^""/)) {
            line = `<blockquote>${line.replace(/^""/, "")}`;
            result += line;
            // i を1つ進める
            // その行を見て、行頭が""で終わらなくなるまで繰り返す
            for (var j = i + 1; j < lines.length; j++) {
                // 行頭が""で終わらなくなるまで繰り返す
                if (lines[j].match(/^""/)) {
                    // ""を取り除いた行をresultに追加
                    result += `<br>` + lines[j].replace(/^""/, "");
                    // iを1つ進める
                    i = j;
                } else {
                    // 行頭が""で終わらない場合は、resultに追加
                    result += `</blockquote>`;
                    // 繰り返しを抜ける
                    break;
                }
            }
            continue;
        }

        // スペースのみから始まればpre
        if (line.match(/^\s/)) {
            // 行頭にあるスペースかタブを削除する
            line = line.replace(/^[\s]/, "");
            line = `<pre>${line.replace()}`;
            result += line;
            // i を1つ進める
            // その行を見て、行頭がスペースもしくはタブで終わらなくなるまで繰り返す
            for (var j = i + 1; j < lines.length; j++) {
                // 行頭がスペースもしくはタブで終わらなくなるまで繰り返す
                if (lines[j].match(/^\s/)) {
                    // スペースもしくはタブを取り除いた行をresultに追加
                    result += "\n" + lines[j].replace(/^[\s]/, "");
                    // iを1つ進める
                    i = j;
                } else {
                    // 行頭がスペースもしくはタブで終わらない場合は、resultに追加
                    result += `</pre>`;
                    // 繰り返しを抜ける
                    break;
                }
            }
            continue;
        }

        // 行の開始が ---- ならば <hr>
        if (line.match(/^----/)) {
            result += `<hr>`;
            continue;
        }

        // 行の開始が // ならばコメント
        if (line.match(/^\/\//)) {
            continue;
        }

        // line 内で ''' で囲まれた部分を強調する
        line = line.replace(/'''(.*?)'''/g, `<strong>$1</strong>`);

        // line 内で '' で囲まれた部分をイタリックにする
        line = line.replace(/''(.*?)''/g, `<i>$1</i>`);

        // line 内で == で囲まれた部分に打ち消し線を付ける
        line = line.replace(/==(.*?)==/g, `<del>$1</del>`);

        // line 内で __ で囲まれた部分に下線を付ける
        line = line.replace(/__(.*?)__/g, `<u>$1</u>`);

        // line 内で [[ で囲まれた部分を.dammyLinkにする
        // もし中にある | で区切られているのであれば、区切られた部分最初の部分を.dammyLinkの見出しにする
        line = line.replace(
            /\[\[(.*?)\|(.*?)\]\]/g,
            `<span class="dammyLink">$1</span>`
        );

        // line 内で [[ で囲まれた部分を.dammyLinkにする
        line = line.replace(/\[\[(.*?)\]\]/g, `<span class="dammyLink">$1</span>`);

        // line 内で [ で囲まれた部分を.dammyLinkにする
        // 中にある | で区切られた部分最初の部分を.dammyLinkの見出しにする
        line = line.replace(
            /\[(.*?)\|(.*?)\]/g,
            `<span class="dammyLink">$1</span>`
        );

        // line 内に URL があれば.dammyLinkにする
        line = line.replace(
            /https?:\/\/[-_.!~*'()a-zA-Z0-9;\/?:\@&=+\$,%#]+/g,
            `<span class="dammyLink">$&</span>`
        );

        // line 内に mailto: があれば.dammyLinkにする
        line = line.replace(
            /mailto:[-_.!~*'()a-zA-Z0-9;\/?:\@&=+\$,%#]+/g,
            `<span class="dammyLink">$&</span>`
        );

        // :::説明文 dd
        if (line.match(/^:::/)) {
            line = `<dd>${line.replace(/^:::/, "")}`;
            result += line;
            // iを1つ進める
            // その行を見て、行頭が:::で終わらなくなるまで繰り返す
            for (var j = i + 1; j < lines.length; j++) {
                // 行頭が:::で終わらなくなるまで繰り返す
                if (lines[j].match(/^:::/)) {
                    // :::を取り除いた行をresultに追加
                    result += lines[j].replace(/^:::/, "");
                    // iを1つ進める
                    i = j;
                } else {
                    // 行頭が:::で終わらない場合は、resultに追加
                    result += `</dd>`;
                    // 繰り返しを抜ける
                    break;
                }
            }
            continue;
        }

        // ::項目
        if (line.match(/^::/)) {
            line = `<dt>${line.replace(/^::/, "")}</dt>`;
            result += line;
            continue;
        }

        // :項目:説明文
        if (line.match(/^:/)) {
            // line から最初の:を取り除いた文字列を項目として取得
            line = line.replace(/^:/, "");
            // : で区切って項目と説明文に分割
            var item = line.split(/:/);
            // 項目と説明文をresultに追加
            result += `<dt>${item[0]}</dt><dd>${item[1]}</dd>`;
            continue;
        }

        // 行の開始が *** ならばレベル 3 のリスト
        // なお、*** を除いた行頭のスペースは削除する
        if (line.match(/^(\*\*\*)/)) {
            line = line.replace(/^(\*\*\*)/, "").replace(/^\s+/, "");
            line = `<li>` + line + `</li>`;

            // 初めての *** の場合
            if (!is_ul3) {
                line = `<ul class="level3">` + line;
                is_ul3 = true;
            }

            // 次の行が *** でない場合
            if (i < lines.length - 1 && !lines[i + 1].match(/^(\*\*\*)/)) {
                line += `</ul>`;
                is_ul3 = false;

                // 次の行が ** でない場合
                if (i < lines.length - 1 && !lines[i + 1].match(/^(\*\*)/)) {
                    if (is_ul2) {
                        line += `</ul>`;
                        is_ul2 = false;
                    }

                    // 次の行が * でない場合
                    if (i < lines.length - 1 && !lines[i + 1].match(/^(\*)/)) {
                        if (is_ul1) {
                            line += `</ul>`;
                            is_ul1 = false;
                        }
                    }
                }
            }
            result += line;
            continue;
        }

        // 行の開始が ** ならばレベル 2 のリスト
        // なお、** を除いた行頭のスペースは削除する
        if (line.match(/^(\*\*)/)) {
            line = line.replace(/^(\*\*)/, "").replace(/^\s+/, "");
            line = `<li>` + line + `</li>`;

            // 初めての ** の場合
            if (!is_ul2) {
                line = `<ul class="level2">` + line;
                is_ul2 = true;
            }

            // 次の行が ** でない場合
            if (i < lines.length - 1 && !lines[i + 1].match(/^(\*\*)/)) {
                line += `</ul>`;
                is_ul2 = false;

                // 次の行が * でない場合
                if (i < lines.length - 1 && !lines[i + 1].match(/^(\*)/)) {
                    if (is_ul1) {
                        line += `</ul>`;
                        is_ul1 = false;
                    }
                }
            }
            result += line;
            continue;
        }

        // 行の開始が * ならばレベル 1 のリスト
        // なお、* を除いた行頭のスペースは削除する
        if (line.match(/^(\*)/)) {
            line = line.replace(/^\*/, "").replace(/^\s+/, "");
            line = `<li>` + line + `</li>`;

            // 初めての * の場合
            if (!is_ul1) {
                line = `<ul class="level1">` + line;
                is_ul1 = true;
            }

            // 次の行が * でない場合
            if (i < lines.length - 1 && !lines[i + 1].match(/^(\*)/)) {
                line += `</ul>`;
                is_ul1 = false;
            }
            result += line;
            continue;
        }

        // 行の開始が +++ ならばレベル 3 のリスト ol
        // なお、+++ を除いた行頭のスペースは削除する
        if (line.match(/^(\+\+\+)/)) {
            line = line.replace(/^(\+\+\+)/, "").replace(/^\s+/, "");
            line = `<li>` + line + `</li>`;

            // 初めての +++ の場合
            if (!is_ol3) {
                line = `<ol class="level3">` + line;
                is_ol3 = true;
            }

            // 次の行が +++ でない場合
            if (i < lines.length - 1 && !lines[i + 1].match(/^(\+\+\+)/)) {
                line += `</ol>`;
                is_ol3 = false;

                // 次の行が ++ でない場合
                if (i < lines.length - 1 && !lines[i + 1].match(/^(\+\+)/)) {
                    if (is_ol2) {
                        line += `</ol>`;
                        is_ol2 = false;
                    }

                    // 次の行が + でない場合
                    if (i < lines.length - 1 && !lines[i + 1].match(/^(\+)/)) {
                        if (is_ol1) {
                            line += `</ol>`;
                            is_ol1 = false;
                        }
                    }
                }
            }
            result += line;
            continue;
        }

        // 行の開始が ++ ならばレベル 2 のリスト ol
        // なお、++ を除いた行頭のスペースは削除する
        if (line.match(/^(\+\+)/)) {
            line = line.replace(/^(\+\+)/, "").replace(/^\s+/, "");
            line = `<li>` + line + `</li>`;

            // 初めての ++ の場合
            if (!is_ol2) {
                line = `<ol class="level2">` + line;
                is_ol2 = true;
            }

            // 次の行が ++ でない場合
            if (i < lines.length - 1 && !lines[i + 1].match(/^(\+\+)/)) {
                line += `</ol>`;
                is_ol2 = false;

                // 次の行が + でない場合
                if (i < lines.length - 1 && !lines[i + 1].match(/^(\+)/)) {
                    if (is_ol1) {
                        line += `</ol>`;
                        is_ol1 = false;
                    }
                }
            }
            result += line;
            continue;
        }

        // 行の開始が + ならばレベル 1 のリスト ol
        // なお、+ を除いた行頭のスペースは削除する
        if (line.match(/^(\+)/)) {
            line = line.replace(/^\+/, "").replace(/^\s+/, "");
            line = `<li>` + line + `</li>`;

            // 初めての + の場合
            if (!is_ol1) {
                line = `<ol class="level1">` + line;
                is_ol1 = true;
            }

            // 次の行が + でない場合
            if (i < lines.length - 1 && !lines[i + 1].match(/^(\+)/)) {
                line += `</ol>`;
                is_ol1 = false;
            }
            result += line;
            continue;
        }

        // 行の開始がカンマならば表
        if (line.match(/^,/)) {
            line = line.replace(/^,/, "").replace(/^\s+/, "");
            // カンマでsplitして、それぞれの要素を取り出す
            let cols = line.split(",");

            // もし is_th が false ならば、カラム名を取り出す
            if (!is_th) {
                cols = cols.map((col) => {
                    is_th = true;
                    return `<th>` + col + `</th>`;
                });
            } else {
                cols = cols.map((col) => {
                    return `<td>` + col + `</td>`;
                });
            }

            // カンマでsplitした要素を、<tr>で囲む
            line = `<tr>` + cols.join("") + `</tr>`;

            // table タグを開始する
            if (!is_table) {
                line = `<table>` + line;
                is_table = true;
            }

            // 次の行がカンマでない場合
            if (i < lines.length - 1 && !lines[i + 1].match(/^,/)) {
                line += `</table>`;
                is_table = false;
                is_th = false;
            }
            result += line;
            continue;
        }

        // lineに何もない場合は、空行を追加する
        if (!line) {
            result += `</p><span></span>`;
            continue;
        }

        // ただのテキスト
        // もし result の最後が </p> で終わっているならば削除する
        if (result.match(/<\/p>$/)) {
            result = result.replace(/<\/p>$/, "");
            result += line + `</p>`;
            continue;
        } else {
            result += `<p>` + line + `</p>`;
        }
    }
}

// console.log(editor.getValue());
convert(code);
result += `<span style="height: 90% !important; display: block;"></span>`;
$("#container").html(result);