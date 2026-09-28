import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let menu = ['Cookies and cream', 'Mint choc chip', 'Raspberry ripple'];
		let order = writable({ flavours: ['Mint choc chip'], scoops: 1 });

		$$renderer.push(`<form method="POST"><input type="radio"${$.attr('checked', $.store_get($$store_subs ??= {}, '$order', order).scoops === 1, true)} name="scoops"${$.attr('value', 1)}/> One scoop <input type="radio"${$.attr('checked', $.store_get($$store_subs ??= {}, '$order', order).scoops === 2, true)} name="scoops"${$.attr('value', 2)}/> Two scoops <input type="radio"${$.attr('checked', $.store_get($$store_subs ??= {}, '$order', order).scoops === 3, true)} name="scoops"${$.attr('value', 3)}/> Three scoops <!--[-->`);

		const each_array = $.ensure_array_like(menu);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let flavour = each_array[$$index];

			$$renderer.push(`<input type="checkbox"${$.attr('checked', $.store_get($$store_subs ??= {}, '$order', order).flavours.includes(flavour), true)} name="flavours"${$.attr('value', flavour)}/> ${$.escape(flavour)}`);
		}

		$$renderer.push(`<!--]--></form> <div id="output">${$.escape($.store_get($$store_subs ??= {}, '$order', order).flavours.join('+'))}</div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}