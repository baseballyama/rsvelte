import * as $ from 'svelte/internal/server';

export default function Index_signature_no_rest_input($$renderer, $$props) {
	let { name, age } = $$props;

	console.log(name, age);
}