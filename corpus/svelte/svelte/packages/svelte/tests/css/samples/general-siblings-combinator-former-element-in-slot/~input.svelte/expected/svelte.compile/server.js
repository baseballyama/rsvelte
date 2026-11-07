import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);

	$.slot($$renderer, $$props, 'default', {}, () => {
		$$renderer.push(`<h1 class="svelte-9oquys">Heading 1</h1>`);
	});

	$$renderer.push(`<!--]--> <span>Span 1</span> <span>Span 2</span> <p class="svelte-9oquys">Paragraph 2</p>`);
}