import * as $ from 'svelte/internal/server';

export default function Ignore_test01_input($$renderer) {
	let selected = 'foo';

	$$renderer.push(`<button class="selected-b">foo</button> <button class="a-selected">foo</button> <button class="a selected b">foo</button>`);
}