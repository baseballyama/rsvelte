import * as $ from 'svelte/internal/server';

export default function Highlighted($$renderer, $$props) {
	// Based on https://github.com/metonym/svelte-highlight/blob/master/src/LangTag.svelte
	let { lang, highlighted } = $$props;

	$$renderer.push(`<pre${$.attr('data-language', lang)}><code class="hljs">${$.html(highlighted)}</code></pre>`);
}