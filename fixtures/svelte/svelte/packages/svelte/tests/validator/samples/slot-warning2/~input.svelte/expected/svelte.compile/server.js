import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Input($$renderer) {
	Component($$renderer, {
		$$slots: {
			foo: ($$renderer) => {
				$$renderer.push(`<div slot="foo">hi!</div>`);
			}
		}
	});
}