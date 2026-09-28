import * as $ from 'svelte/internal/server';
import { lockscroll } from '@svelte-put/lockscroll';

export default function Scroll_container($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let locked = false;

		$$renderer.push(`<button class="c-btn mx-auto">Toggle lock scroll for below section</button> <section class="bg-bg-soft mt-4 max-h-[400px] overflow-auto rounded px-6"><!--[-->`);

		const each_array = $.ensure_array_like(new Array(10));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let _ = each_array[$$index];

			$$renderer.push(`<p>What is Lorem Ipsum? Lorem Ipsum is simply dummy text of the printing and typesetting
			industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when
			an unknown printer took a galley of type and scrambled it to make a type specimen book. It has
			survived not only five centuries, but also the leap into electronic typesetting, remaining
			essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets
			containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus
			PageMaker including versions of Lorem Ipsum.</p>`);
		}

		$$renderer.push(`<!--]--></section>`);
	});
}