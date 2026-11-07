import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { rows = [], row } = $$props;

		rows[row] = '';
		$.bind_props($$props, { rows });
	});
}