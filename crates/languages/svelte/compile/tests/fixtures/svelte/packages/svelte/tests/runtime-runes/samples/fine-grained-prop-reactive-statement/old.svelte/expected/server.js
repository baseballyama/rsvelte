import * as $ from 'svelte/internal/server';

export default function Old($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count_2;
		let prop = $$props['prop'];
		let count_1 = prop.count;

		$: {
			count_1 = prop.count;
		}

		$: count_2 = prop.count;

		$$renderer.push(`<p>${$.escape(count_1)} / ${$.escape(count_2)}</p>`);
		$.bind_props($$props, { prop });
	});
}