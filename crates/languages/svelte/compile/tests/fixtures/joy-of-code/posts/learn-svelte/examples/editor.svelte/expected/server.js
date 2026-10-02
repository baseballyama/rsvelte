import * as $ from 'svelte/internal/server';

export default function Editor($$renderer) {
	let editor = { theme: 'dark', content: '<h1>Svelte</h1>' };

	$$renderer.push(`<div class="container editor svelte-i39yxc"><textarea spellcheck="false" class="svelte-i39yxc">`);

	const $$body = $.escape(editor.content);

	if ($$body) {
		$$renderer.push(`${$$body}`);
	} else {}

	$$renderer.push(`</textarea> ${$.html(editor.content)}</div>`);
}