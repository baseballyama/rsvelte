import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let tag = 'div';

	$$renderer.push(`<div><p class="before svelte-1dexvva">before</p> `);

	$.element($$renderer, tag, () => {
		$$renderer.push(` class="x svelte-1dexvva"`);
	});

	$$renderer.push(` <p class="foo svelte-1dexvva"><span class="svelte-1dexvva">foo</span></p> <p class="bar svelte-1dexvva">bar</p></div> <!--[-->`);

	const each_array = $.ensure_array_like([1]);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		$.element($$renderer, tag, () => {
			$$renderer.push(` class="z svelte-1dexvva"`);
		});
	}

	$$renderer.push(`<!--]-->`);
}