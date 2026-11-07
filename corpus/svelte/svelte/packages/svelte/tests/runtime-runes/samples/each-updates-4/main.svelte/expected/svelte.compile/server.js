import * as $ from 'svelte/internal/server';
import { writable } from "svelte/store";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const roomState = writable({ users: { "gary": { name: "gary", value: 100 } } });

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(Object.values($.store_get($$store_subs ??= {}, '$roomState', roomState).users));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let user = each_array[$$index];

			$$renderer.push(`<!---->${$.escape(user.value)}`);
		}

		$$renderer.push(`<!--]--> <button>Update</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}