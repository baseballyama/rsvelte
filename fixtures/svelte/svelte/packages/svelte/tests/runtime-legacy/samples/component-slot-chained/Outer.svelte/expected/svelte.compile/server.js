import * as $ from 'svelte/internal/server';
import Inner from './Inner.svelte';

export default function Outer($$renderer, $$props) {
	Inner($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);
			$.slot($$renderer, $$props, 'default', {}, null);
			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}