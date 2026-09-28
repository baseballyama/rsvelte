import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.push(`<h1 class="svelte-52lxke">Heading 1</h1> <span>Span 1</span> <span>Span 2</span> <!--[-->`);

	$.slot($$renderer, $$props, 'default', {}, () => {
		$$renderer.push(`<p class="svelte-52lxke">Paragraph 2</p>`);
	});

	$$renderer.push(`<!--]-->`);
}