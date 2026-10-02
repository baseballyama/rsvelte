import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	MyComponent($$renderer, {
		variant: 'outlined',
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);
			$.slot($$renderer, $$props, 'default', {}, null);
			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}