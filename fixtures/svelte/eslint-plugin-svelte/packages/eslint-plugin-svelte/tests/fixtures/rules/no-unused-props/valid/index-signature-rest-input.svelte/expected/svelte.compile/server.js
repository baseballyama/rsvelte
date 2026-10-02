import * as $ from 'svelte/internal/server';

export default function Index_signature_rest_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { name, age, $$slots, $$events, ...rest } = $$props;

		console.log(name, age, rest.isAdmin, rest.role);
	});
}