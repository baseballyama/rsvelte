import * as $ from 'svelte/internal/server';

export default function Output($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	console.log(props);
}