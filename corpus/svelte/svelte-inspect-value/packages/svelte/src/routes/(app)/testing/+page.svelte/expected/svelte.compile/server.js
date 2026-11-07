import * as $ from 'svelte/internal/server';
import { inspectElement } from '$lib/attachments/inspect-element.js';
import Inspect from '$lib/index.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let array = [];
		let asdf = { [Symbol('bababa')]: 'hei' };
		let num = 3;

		$$renderer.push(`<div class="flex row"><button>+</button> <button>-</button></div> `);
		Inspect($$renderer, { values: { array }, expandLevel: 0 });
		$$renderer.push(`<!----> `);

		if (Inspect.Values) {
			$$renderer.push('<!--[-->');
			Inspect.Values($$renderer, $.spread_props([{ array }, asdf]));
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` <textarea style="resize: both; max-width: 320px">fififi</textarea> <input type="number"${$.attr('value', num)} autocomplete="off"/> <div${$.attr('data-num', num)}></div> <div contenteditable="">fafafaf</div> <ul><!--[-->`);

		const each_array = $.ensure_array_like(array);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let num = each_array[$$index];

			$$renderer.push(`<li>${$.escape(num)}</li>`);
		}

		$$renderer.push(`<!--]--></ul>`);
	});
}