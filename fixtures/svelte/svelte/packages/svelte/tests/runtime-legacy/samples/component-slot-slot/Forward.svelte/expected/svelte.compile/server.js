import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Forward($$renderer, $$props) {
	Component($$renderer, {
		$$slots: {
			test: ($$renderer) => {
				$$renderer.push(`<!--[-->`);
				$.slot($$renderer, $$props, 'default', {}, null);
				$$renderer.push(`<!--]-->`);
			}
		}
	});
}