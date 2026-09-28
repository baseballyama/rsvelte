import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	Component($$renderer, {
		$$slots: {
			foo: ($$renderer) => {
				$$renderer.push(`<div slot="foo"></div>`);
			}
		}
	});
}