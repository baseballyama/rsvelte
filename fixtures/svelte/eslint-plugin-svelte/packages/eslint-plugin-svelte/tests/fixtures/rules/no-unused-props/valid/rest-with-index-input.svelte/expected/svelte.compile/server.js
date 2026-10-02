import * as $ from 'svelte/internal/server';

export default function Rest_with_index_input($$renderer, $$props) {
	let { name, $$slots, $$events, ...rest } = $$props;

	console.log(name, rest);
}