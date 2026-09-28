import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { label, $$slots, $$events, ...rest } = $$props;

		$$renderer.push(`<button>${$.escape(label)}</button>`);
	});
}