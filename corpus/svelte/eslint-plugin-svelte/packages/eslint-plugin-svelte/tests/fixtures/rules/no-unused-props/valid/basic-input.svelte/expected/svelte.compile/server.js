import * as $ from 'svelte/internal/server';

export default function Basic_input($$renderer, $$props) {
	let { a, b } = $$props;

	console.log(a, b);
}