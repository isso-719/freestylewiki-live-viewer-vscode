import * as assert from 'assert';
import HTMLParse from "../lib/parser";

suite('HTMLParser Test Suite', () => {
    // Test Pattern From https://fswiki.osdn.jp/cgi-bin/wiki.cgi?page=Help
    test('Test Heading', () => {
        const input = `!!!大見出し\n!!中見出し\n!小見出し`;
        const expected = `<h2>大見出し</h2>\n<h3>中見出し</h3>\n<h4>小見出し</h4>`;
        const result = HTMLParse(input);
        assert.strictEqual(result, expected);
    });

    test('Test Text Decolation', () => {
        const input = `シングルクォート２つで囲むと''イタリック''になります。\nシングルクォート３つで囲むと'''ボールド'''になります。\nこれは==打ち消し線==です。\nこれは__下線__です。`;
        const expected = `シングルクォート２つで囲むと<em>イタリック</em>になります。\nシングルクォート３つで囲むと<strong>ボールド</strong>になります。\nこれは<del>打ち消し線</del>です。\nこれは<ins>下線</ins>です。`;
        const result = HTMLParse(input);
        assert.strictEqual(result, expected);
    });

    test('Test Quote', () => {
        const input = `""これは引用です。\n""これも引用です。`;
        const expected = `<blockquote><p>これは引用です。</p><p>これも引用です。</p></blockquote>`;
        const result = HTMLParse(input);
        assert.strictEqual(result, expected);
    });

    test('Test Single Line Definition', () => {
        const input = `:説明:内容`;
        const expected = `<dl><dt>説明</dt><dd>内容</dd></dl>`;
        const result = HTMLParse(input);
        assert.strictEqual(result, expected);
    });

    test('Test Multi Line Definition', () => {
        const input = `::説明\n:::内容\n:::内容`;
        const expected = `<dl><dt>説明</dt><dd>内容</dd><dd>内容</dd></dl>`;
        const result = HTMLParse(input);
        assert.strictEqual(result, expected);
    });

    test('Test Unordered List', () => {
        const input = `***項目1\n**項目2\n*項目3`;
        const expected = `<li style="margin-left: 20px;">項目1</li>\n<li style="margin-left: 10px;">項目2</li>\n<li>項目3</li>`;
        const result = HTMLParse(input);
        assert.strictEqual(result, expected);
    });

    test('Test Ordered List', () => {
        const input = `+++項目1\n++項目2\n+項目3`;
        const expected = `<li style="margin-left: 20px;">項目1</li>\n<li style="margin-left: 10px;">項目2</li>\n<li>項目3</li>`;
        const result = HTMLParse(input);
        assert.strictEqual(result, expected);
    });

    test('Test Link', () => {
        const input = `* http://www.yahoo.co.jp/\n* [Google|http://www.google.co.jp/]\n* [[FrontPage]]\n* [[トップ|FrontPage]]`;
        const expected = `<ul><li><a href="http://www.yahoo.co.jp/">http://www.yahoo.co.jp/</a></li><li><a href="http://www.google.co.jp/">Google</a></li><li><a href="wiki.cgi?page=FrontPage" class="wikipage">FrontPage</a></li><li><a href="wiki.cgi?page=FrontPage" class="wikipage">トップ</a></li></ul>`;
    });

    test('Test Table', () => {
        const input = `,1-1,1-2,1-3\n,2-1,2-2,2-3`;
        const expected = `<table><tbody><tr><th>1-1</th><th>1-2</th><th>1-3</th></tr><tr><td>2-1</td><td>2-2</td><td>2-3</td></tr></tbody></table>`;
        const result = HTMLParse(input);
        assert.strictEqual(result, expected);
    });

    test('Test Pre', () => {
        const input = `  pre\n  pre\n  pre`;
        const expected = `<pre>  pre\n  pre\n  pre</pre>`;
        const result = HTMLParse(input);
        assert.strictEqual(result, expected);
    });

    test('Test Horizontal Line', () => {
        const input = `----`;
        const expected = `<hr>`;
        const result = HTMLParse(input);
        assert.strictEqual(result, expected);
    });

    test('Test Comment', () => {
        const input = `//これはコメントになります。画面には出力されません。`;
        const expected = ``;
        const result = HTMLParse(input);
        assert.strictEqual(result, expected);
    });
});
