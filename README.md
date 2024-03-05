<img src="images/logo.png" width="180px" style="display: block; margin: 20 auto;">

<h1 style="text-align: center;">FreeStyleWiki Live Viewer for VSCode</h1>

<p style="text-align: center;">Live preview FreeStyleWiki (a.k.a FSWiki, FSW) file for VSCode.</p>

<img src="images/demo.png" width="100%" style="display: block; margin: 0 auto; max-width: 640px; height: auto;">

## Install

Download on the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=KazukiIsogai.FS-Live-Viewer).

## Getting Started

1. Open your FreeStyle Wiki Article (`.fsw`, `.fswiki` extension file).

2. Open this extension with command pallet.

    -  On macOS.
        1. `Command + Shift + p` to open command pallet.
        2. Put `fslive`.
        3. Select `FreeStyleWiki Live Viewer`.

    - On Windows.
        1. `Ctrl + Shift + p` to open command pallet.
        2. Put `fslive`.
        3. Select `FreeStyleWiki Live Viewer`.

3. Enjoy 🎉

## Supported File Extensions

- `.fsw`
- `.fswiki`

## How to Contribute

1. Clone [freestylewiki-live-viewer-vscode](https://github.com/isso-719/freestylewiki-live-viewer-vscode) repository.

2. Install dependencies.

    ```bash
    npm install
    ```

3. Make changes.

4. Compile TypeScript files.

    ```bash
    npm run compile
    ```

5. Push `F5` key on VSCode and enjoy debugging.

6. Run tests.

    ```bash
    npm lint
    npm test
    ```

## Build

if you want export to `.vsix` file, run below command.

```bash
npm run build
```

## License

Apache License 2.0. See [LICENSE](./LICENSE) file for more information.

## The Logo

The Logo created by [DALL-E 3](https://openai.com/dall-e-3) AI.

## Reference

- [Help - FreeStyleWiki](https://fswiki.osdn.jp/cgi-bin/wiki.cgi?page=Help)
