import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer) {
	let selected = 'foo';

	$$renderer.push(`<button${$.attr_class($.clsx(selected ? 'selected' : ''))}>foo</button> <button class="a selected b">foo</button> <button class="a selected b">foo</button>`);
}