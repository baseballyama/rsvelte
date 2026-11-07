<script lang="ts">
    import CodeMirror, { type CodeMirrorProps } from "$lib";

    import { css } from "@codemirror/lang-css";
    import { html } from "@codemirror/lang-html";
    import { javascript } from "@codemirror/lang-javascript";
    import { oneDark } from "@codemirror/theme-one-dark";

    import { cssValue, htmlValue, javascriptValue, typescriptValue } from "./_util/code";

    let value = $state("");

    let props: CodeMirrorProps = $state({
        allowMultiSelect: true,
        useTab: true,
        editable: true,
        lineWrapping: false,
        lineNumbers: true,
        highlight: { activeLine: true, activeLineGutter: true, specialChars: true, selectionMatches: true },
        history: true,
        foldGutter: true,
        drawSelection: true,
        dropCursor: true,
        indentOnInput: true,
        syntaxHighlighting: true,
        bracketMatching: true,
        closeBrackets: true,
        autocompletion: true,
        rectangularSelection: true,
        crosshairCursor: true,
        readonly: false,
        tabSize: 2,
        placeholder: null,
        lang: null,
        theme: null,
        nodebounce: false,
    });

    const languages = ["custom", "javascript", "typescript", "css", "html"];
    let language = $state("custom");

    const themes = ["default", "onedark"];
    let theme = $state("default");

    function on_language_change(): void {
        switch (language) {
            case "custom":
                props.lang = null;
                break;
            case "javascript":
                props.lang = javascript();
                value = javascriptValue();
                break;
            case "typescript":
                props.lang = javascript({ typescript: true });
                value = typescriptValue();
                break;
            case "html":
                props.lang = html({ matchClosingTags: true });
                value = htmlValue();
                break;
            case "css":
                props.lang = css();
                value = cssValue();
                break;
        }
    }

    function on_theme_change(): void {
        switch (theme) {
            case "default":
                props.theme = null;
                break;
            case "onedark":
                props.theme = oneDark;
                break;
        }
    }
</script>

<div class="demo">
    <CodeMirror bind:value class="editor" {...props} />

    <div class="props">
        <h5>Basic setup</h5>
        <div class="props-section">
            <div class="toggle">
                <input id="basic" type="checkbox" bind:checked={props.allowMultiSelect as boolean} />
                <label for="basic">Allow multi-select</label>
            </div>
            <div class="toggle">
                <input id="editable" type="checkbox" bind:checked={props.editable} />
                <label for="editable">Editable</label>
            </div>
            <div class="toggle">
                <input id="readonly" type="checkbox" bind:checked={props.readonly} />
                <label for="readonly">Read-only</label>
            </div>
            <div class="toggle">
                <input id="lineWrapping" type="checkbox" bind:checked={props.lineWrapping} />
                <label for="lineWrapping">Line Wrapping</label>
            </div>
            <div class="toggle">
                <input id="nodebounce" type="checkbox" bind:checked={props.nodebounce} />
                <label for="nodebounce">No debounce</label>
            </div>
        </div>
        <div class="props-section">
            <div class="toggle">
                <input id="basic" type="checkbox" bind:checked={props.lineNumbers as boolean} />
                <label for="basic">Show line numbers</label>
            </div>
            <div class="toggle">
                <input id="editable" type="checkbox" bind:checked={props.history as boolean} />
                <label for="editable">History</label>
            </div>
            <div class="toggle">
                <input id="readonly" type="checkbox" bind:checked={props.foldGutter as boolean} />
                <label for="readonly">Fold Gutter</label>
            </div>
            <div class="toggle">
                <input id="lineWrapping" type="checkbox" bind:checked={props.drawSelection as boolean} />
                <label for="lineWrapping">Draw Selection</label>
            </div>
            <div class="toggle">
                <input id="nodebounce" type="checkbox" bind:checked={props.dropCursor} />
                <label for="nodebounce">Drop Cursor</label>
            </div>
        </div>
        <div class="props-section">
            <div class="toggle">
                <input id="basic" type="checkbox" bind:checked={props.indentOnInput as boolean} />
                <label for="basic">Indent on Input</label>
            </div>
            <div class="toggle">
                <input id="editable" type="checkbox" bind:checked={props.syntaxHighlighting as boolean} />
                <label for="editable">Syntax Highlighting</label>
            </div>
            <div class="toggle">
                <input id="readonly" type="checkbox" bind:checked={props.bracketMatching as boolean} />
                <label for="readonly">Bracket Matching</label>
            </div>
            <div class="toggle">
                <input id="lineWrapping" type="checkbox" bind:checked={props.closeBrackets as boolean} />
                <label for="lineWrapping">Close Brackets</label>
            </div>
            <div class="toggle">
                <input id="nodebounce" type="checkbox" bind:checked={props.autocompletion as boolean} />
                <label for="nodebounce">Autocompletion</label>
            </div>
        </div>
        <div class="props-section">
            <div class="toggle">
                <input id="basic" type="checkbox" bind:checked={props.rectangularSelection as boolean} />
                <label for="basic">Rectangular Selection</label>
            </div>
            <div class="toggle">
                <input id="editable" type="checkbox" bind:checked={props.crosshairCursor as boolean} />
                <label for="editable">Crosshair Cursor</label>
            </div>
        </div>

        <h5>Tab</h5>
        <div class="props-section">
            <div class="toggle">
                <input id="useTab" type="checkbox" bind:checked={props.useTab} />
                <label for="useTab">Enable Tab</label>
            </div>
            <div class="input">
                <label for="tabSize">Tab size</label>
                <input id="tabSize" type="number" bind:value={props.tabSize} step="1" />
            </div>
        </div>

        <h5>Language</h5>
        <div class="props-section">
            <div class="input">
                <label for="language">Language</label>
                <select id="language" bind:value={language} onchange={on_language_change}>
                    {#each languages as lang (lang)}
                        <option>{lang}</option>
                    {/each}
                </select>
            </div>
        </div>

        <h5>Theme</h5>
        <div class="props-section">
            <div class="input">
                <label for="theme">Theme</label>
                <select id="theme" bind:value={theme} onchange={on_theme_change}>
                    {#each themes as thm (thm)}
                        <option>{thm}</option>
                    {/each}
                </select>
            </div>
        </div>
    </div>
</div>

<style>
    .demo {
        position: relative;
        height: 100%;
        display: grid;
        grid-template-rows: 1fr auto;
        overflow: hidden;
    }

    :global(.editor) {
        overflow: hidden;
    }

    .props {
        padding: 1rem;
        background: #edf2ff;
        border-top: solid 1px #ddd;
    }

    .props > h5:not(:first-child) {
        margin-top: 1rem;
        margin-bottom: 0.5rem;
    }

    .props-section {
        display: flex;
        flex-wrap: wrap;
    }

    .toggle {
        display: flex;
        align-items: center;
        font-size: 0.85rem;
        margin-right: 1rem;
    }
    .toggle > label {
        margin-left: 0.5rem;
        user-select: none;
    }

    .input {
        display: flex;
        align-items: center;
        font-size: 0.85rem;
        margin-right: 1rem;
    }
    .input > label {
        margin-right: 0.5rem;
        user-select: none;
    }

    input[type="number"] {
        width: 50px;
        text-align: right;
    }
</style>
