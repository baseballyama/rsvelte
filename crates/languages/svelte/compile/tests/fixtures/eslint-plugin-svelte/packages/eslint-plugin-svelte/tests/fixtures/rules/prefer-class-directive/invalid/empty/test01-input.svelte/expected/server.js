import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer) {
	let selected = 'foo';
	let children = 1;

	$$renderer.push(`<button${$.attr_class($.clsx(selected ? 'selected' : ''))}>foo</button> <button class="a selected b">foo</button> <button class="a selected b">foo</button> <div class="d-flex ">foo</div> <div class="d-flex ">foo</div>`);
}