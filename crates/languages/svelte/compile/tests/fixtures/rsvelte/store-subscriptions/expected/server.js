import * as $ from "svelte/internal/server";
import { writable } from "svelte/store";
import { page } from "$app/stores";
export default function Store_subscriptions($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { store } = $$props;
		const count = writable(0);
		let obj = writable({ a: 1 });
		function inc() {
			$.store_set(count, $.store_get($$store_subs ??= {}, "$count", count) + 1);
			$.update_store($$store_subs ??= {}, "$count", count);
			$.store_mutate($$store_subs ??= {}, "$obj", obj, $.store_get($$store_subs ??= {}, "$obj", obj).a = 2);
			$.store_set(obj, { a: 3 });
		}
		let d = $.derived(() => $.store_get($$store_subs ??= {}, "$count", count) * 2);
		console.log($.store_get($$store_subs ??= {}, "$page", page).url);
		$$renderer.push(`<p>${$.escape($.store_get($$store_subs ??= {}, "$count", count))} ${$.escape($.store_get($$store_subs ??= {}, "$store", store))} ${$.escape($.store_get($$store_subs ??= {}, "$obj", obj).a)} ${$.escape(d())}</p> <input${$.attr("value", $.store_get($$store_subs ??= {}, "$count", count))}/> <button>x</button> <!--[-->`);
		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, "$obj", obj).list);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];
			$$renderer.push(`<!---->${$.escape(item)}`);
		}
		$$renderer.push(`<!--]-->`);
		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
