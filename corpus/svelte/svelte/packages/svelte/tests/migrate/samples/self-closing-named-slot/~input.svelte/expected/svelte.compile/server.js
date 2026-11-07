import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	Component($$renderer, {
		$$slots: {
			test: ($$renderer) => {
				$$renderer.push(`<div slot="test"></div>`);
			}
		}
	});
}