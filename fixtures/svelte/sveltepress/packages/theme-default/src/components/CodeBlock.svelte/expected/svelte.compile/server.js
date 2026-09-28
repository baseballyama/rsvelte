import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import themeOptions from 'virtual:sveltepress/theme-default';

export default function CodeBlock($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {object} Props
		 * @property {string} [code] - The code value
		 * @property {string} [lang] - The language of the code
		 */
		/** @type {Props} */
		let { code = '', lang } = $$props;

		let highlightedCode = '';

		async function loadShikiAndHighlight() {
			const { codeToHtml } = await import('shiki');

			highlightedCode = await codeToHtml(code, {
				lang,
				themes: {
					dark: themeOptions.highlighter.themeDark ?? 'night-owl',
					light: themeOptions.highlighter.themeDark ?? 'vitesse-light'
				}
			});
		}

		onMount(() => {
			loadShikiAndHighlight();
		});

		$$renderer.push(`<div>${$.html(highlightedCode)}</div>`);
	});
}