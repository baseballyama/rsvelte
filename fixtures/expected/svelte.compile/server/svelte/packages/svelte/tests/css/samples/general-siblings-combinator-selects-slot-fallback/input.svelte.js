import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.push(`<h1 class="svelte-1psur7u">Heading 1</h1> <span>Span 1</span> <span>Span 2</span> <!--[-->`);

	$.slot($$renderer, $$props, 'default', {}, () => {
		$$renderer.push(`<p class="svelte-1psur7u">Paragraph 2</p>`);
	});

	$$renderer.push(`<!--]-->`);
}