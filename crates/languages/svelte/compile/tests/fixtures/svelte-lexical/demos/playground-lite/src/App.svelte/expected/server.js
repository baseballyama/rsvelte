import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';
import RichTextComposer from './RichTextComposer.svelte';
import Settings from './settings/Settings.svelte';
import { createSettingsStore } from './settings/settingsStore';
import { ThemeSelector, ThemeImage } from 'svelte-lexical/dist/themes/system-light-dark/ui';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const settings = createSettingsStore();

		setContext('settings', settings);
		$$renderer.push(`<main class="svelte-1n9qyie"><div class="header-container svelte-1n9qyie">`);
		ThemeSelector($$renderer, {});
		$$renderer.push(`<!----></div> `);

		ThemeImage($$renderer, {
			lightSrc: 'images/logo.svg',
			darkSrc: 'images/logo_white.svg',
			alt: 'Svelte Lexical!',
			style: 'margin: 2em; max-width: 800px;'
		});

		$$renderer.push(`<!----> <p>This is the light version of the <a href="https://github.com/umaranis/svelte-lexical/" class="svelte-1n9qyie">svelte-lexical</a> <strong>playground.</strong></p> <p>It includes all plugins except <strong>Shiki Code Highlighter.</strong> <strong>Prism</strong> is used instead for code blocks.</p> <p>It demonstrates most of the features of the library. It is also used for
    running end-to-end (e2e) tests.</p> <div style="text-align: left;">`);

		RichTextComposer($$renderer, {});
		$$renderer.push(`<!----> `);
		Settings($$renderer, {});
		$$renderer.push(`<!----></div></main>`);
	});
}