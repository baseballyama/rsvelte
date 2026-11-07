import * as $ from 'svelte/internal/server';

export default function No_prefix_arrow01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { custom } = $$props;

		custom();
	});
}