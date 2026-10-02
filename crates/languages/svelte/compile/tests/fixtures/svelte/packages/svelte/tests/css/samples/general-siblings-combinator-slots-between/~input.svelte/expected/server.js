import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.push(`<h1 class="svelte-1fx24xx">Heading 1</h1> <!--[-->`);

	$.slot($$renderer, $$props, 'default', {}, () => {
		$$renderer.push(`<span class="svelte-1fx24xx">Span 1</span>`);
	});

	$$renderer.push(`<!--]--> <!--[-->`);

	$.slot($$renderer, $$props, 'default', {}, () => {
		$$renderer.push(`<span class="svelte-1fx24xx">Span 2</span>`);
	});

	$$renderer.push(`<!--]--> <p class="svelte-1fx24xx">Paragraph 2</p>`);
}