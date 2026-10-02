import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	Component($$renderer, {
		$$slots: {
			b: ($$renderer, { a }) => {
				$$renderer.push(`<div slot="b"><!--[-->`);
				$.slot($$renderer, $$props, 'default', { a }, null);
				$$renderer.push(`<!--]--></div>`);
			}
		}
	});
}