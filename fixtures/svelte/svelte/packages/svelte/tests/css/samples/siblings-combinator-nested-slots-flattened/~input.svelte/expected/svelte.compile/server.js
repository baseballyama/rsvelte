import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);

	$.slot($$renderer, $$props, 'default', {}, () => {
		$$renderer.push(`<!--[-->`);

		$.slot($$renderer, $$props, 'default', {}, () => {
			$$renderer.push(`<!--[-->`);

			$.slot($$renderer, $$props, 'default', {}, () => {
				$$renderer.push(`<h1 class="svelte-1vzd41">test</h1>`);
			});

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(`<!--]-->`);
	});

	$$renderer.push(`<!--]--><!--[-->`);

	$.slot($$renderer, $$props, 'default', {}, () => {
		$$renderer.push(`<!--[-->`);

		$.slot($$renderer, $$props, 'default', {}, () => {
			$$renderer.push(`<span class="svelte-1vzd41">Hello</span>`);
		});

		$$renderer.push(`<!--]-->`);
	});

	$$renderer.push(`<!--]-->`);
}