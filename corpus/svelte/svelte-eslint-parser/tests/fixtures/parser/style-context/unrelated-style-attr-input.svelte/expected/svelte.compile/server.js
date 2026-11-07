import * as $ from 'svelte/internal/server';

export default function Unrelated_style_attr_input($$renderer) {
	let a = 10;

	$$renderer.push(`<span class="myClass svelte-q2zymc">Hello!</span> <b class="svelte-q2zymc">10</b>`);
}