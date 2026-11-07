import * as $ from 'svelte/internal/server';

export default function Output($$renderer, $$props) {
	let derived;

	Component($$renderer, {
		$$slots: {
			derived: ($$renderer) => {
				$$renderer.push(`<!--[-->`);
				$.slot($$renderer, $$props, 'derived', {}, null);
				$$renderer.push(`<!--]-->`);
			}
		}
	});
}