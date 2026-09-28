import * as $ from 'svelte/internal/server';
import Composer2RichTextBasic from './Composer2RichTextBasic.svelte';
import Composer3RichTextAdv from './Composer3RichTextAdv.svelte';
import '../../global.css';
import Composer1PlainText from './Composer1PlainText.svelte';
import Composer4RtLinks from './Composer4RTLinks.svelte';
import Composer5Code from './Composer5Code.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<main class="svelte-rlb485"><img src="images/logo.svg" alt="Svelte Lexical!" class="svelte-rlb485"/> <p>Welcome to <a href="https://github.com/umaranis/svelte-lexical/">svelte-lexical</a> demo built using <a href="https://kit.svelte.dev">SvelteKit</a></p> <div style="text-align: left;"><div><div class="example-intro svelte-rlb485"><h1>1. Plain Text Editor</h1> <div><p>Plain text Editor with history plugin.</p> <p>It also has the Action bar (bottom right corner with import/export
            and other actions).</p></div></div> `);

	Composer1PlainText($$renderer, {});
	$$renderer.push(`<!----></div> <div><div class="example-intro svelte-rlb485"><h1>2. Rich Text Editor - Basic</h1> <div>Basic Rich text Editor with no plugins.</div></div> `);
	Composer2RichTextBasic($$renderer, {});

	$$renderer.push(`<!----></div> <div><div class="example-intro svelte-rlb485"><h1>3. Rich Text Editor - Advanced</h1> <div><p>Rich text Editor with the following plugins:</p> <ul><li>History</li> <li>List</li> <li>CheckList</li> <li>HorizontalRule</li> <li>Image</li> <li>MarkdownShortcutPlugin</li></ul> <p>It also adds toolbar color pickers for text color and text
            background.</p></div></div> `);

	Composer3RichTextAdv($$renderer, {});

	$$renderer.push(`<!----></div> <div><div class="example-intro svelte-rlb485"><h1>4. Rich Text Editor with Hyperlinks</h1> <div><p>Rich text Editor with links support using LinkPlugin, AutoLinkPlugin
            and FloatingLinkEditorPlugin.</p> <p>It also includes all plugins from the previous example.</p></div></div> `);

	Composer4RtLinks($$renderer, {});

	$$renderer.push(`<!----></div> <div><div class="example-intro svelte-rlb485"><h1>5. Rich Text Editor with Code Blocks</h1> <div><p>Rich text Editor with support for Code Blocks. It also has \`Code
            Action Menu\` which shows the current language, copy button and
            prettier button for formatting.</p> <p>It also includes all plugins from the previous example.</p> <p>When the focus is inside a Code Block, the toolbar shows dropdown
            for language selection and hides rich text formatting options.</p> <p>The font size drop down is replaced with font size entry control.</p></div></div> `);

	Composer5Code($$renderer, {});
	$$renderer.push(`<!----></div></div> <footer style="margin: 150px"></footer></main>`);
}