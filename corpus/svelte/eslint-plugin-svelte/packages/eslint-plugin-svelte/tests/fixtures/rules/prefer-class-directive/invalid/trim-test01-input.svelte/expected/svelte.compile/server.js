import * as $ from 'svelte/internal/server';

export default function Trim_test01_input($$renderer) {
	let current = 'foo';
	let active = true;

	$$renderer.push(`<button class="active selected">foo</button>`);
}