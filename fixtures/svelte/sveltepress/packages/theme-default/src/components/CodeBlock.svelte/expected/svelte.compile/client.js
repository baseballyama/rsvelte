import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import themeOptions from 'virtual:sveltepress/theme-default';

var root = $.from_html(`<div></div>`);

export default function CodeBlock($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {object} Props
	 * @property {string} [code] - The code value
	 * @property {string} [lang] - The language of the code
	 */
	/** @type {Props} */
	let code = $.prop($$props, 'code', 3, '');

	let highlightedCode = $.state('');

	async function loadShikiAndHighlight() {
		const { codeToHtml } = await import('shiki');

		$.set(
			highlightedCode,
			await codeToHtml(code(), {
				lang: $$props.lang,
				themes: {
					dark: themeOptions.highlighter.themeDark ?? 'night-owl',
					light: themeOptions.highlighter.themeDark ?? 'vitesse-light'
				}
			}),
			true
		);
	}

	onMount(() => {
		loadShikiAndHighlight();
	});

	var div = root();

	$.html(div, () => $.get(highlightedCode), true);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}