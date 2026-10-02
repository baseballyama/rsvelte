import * as $ from 'svelte/internal/server';

export default function Rest_and_index_input($$renderer, $$props) {
	let { a, $$slots, $$events, ...otherProps } = $$props;

	console.log(a, otherProps);
}