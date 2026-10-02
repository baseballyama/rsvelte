import * as $ from 'svelte/internal/server';

function textSnip($$renderer, text) {
	$$renderer.push(`<code class="text-kui-light-gray-900 bg-kui-light-gray-100 dark:bg-kui-dark-gray-100 dark:text-kui-dark-gray-900 border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-md border px-2 py-[3.6px] text-xs">${$.escape(text)}</code>`);
}

export default function RoundedCode($$renderer, $$props) {
	let { text } = $$props;

	textSnip($$renderer, text);
}