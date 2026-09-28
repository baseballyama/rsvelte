import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<h1 class="svelte-12kiksv">Hello!</h1> <div class="svelte-12kiksv"><span>World!</span></div> <!--[-->`);

	const each_array = $.ensure_array_like([]);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let _ = each_array[$$index];

		$$renderer.push(`<p class="svelte-12kiksv"></p>`);
	}

	$$renderer.push(`<!--]-->`);
}