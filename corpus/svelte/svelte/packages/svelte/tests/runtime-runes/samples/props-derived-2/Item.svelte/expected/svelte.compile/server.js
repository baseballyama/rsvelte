import * as $ from 'svelte/internal/server';

export default function Item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { active } = $$props;

		$$renderer.push(`<p>Item is ${$.escape(active ? 'active' : 'inactive')}</p>`);
	});
}