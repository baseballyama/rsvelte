import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let { action_prop } = $$props;
	let action = void 0;

	$$renderer.push(`<div></div> <div></div>`);
}