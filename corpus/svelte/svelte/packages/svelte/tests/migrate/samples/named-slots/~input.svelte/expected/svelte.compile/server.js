import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Input($$renderer, $$props) {
	Component($$renderer, {
		$$slots: {
			msg: ($$renderer) => {
				$$renderer.push(`<!--[-->`);
				$.slot($$renderer, $$props, 'default', {}, null);
				$$renderer.push(`<!--]-->`);
			}
		}
	});
}