import * as $ from "svelte/internal/server";
import { writable } from "svelte/store";
export default function Each_store_destructured($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const items = writable([]);
		$$renderer.push(`<!--[-->`);
		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, "$items", items));
		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let { name, icon = 1 } = each_array[i];
			$$renderer.push(`<p>${$.escape(name)}${$.escape(icon)}${$.escape(i)}</p>`);
		}
		$$renderer.push(`<!--]--> <!--[-->`);
		const each_array_1 = $.ensure_array_like($.store_get($$store_subs ??= {}, "$items", items));
		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let [a, b] = each_array_1[$$index_1];
			$$renderer.push(`<button>${$.escape(a)}${$.escape(b)}</button>`);
		}
		$$renderer.push(`<!--]--> <!--[-->`);
		const each_array_2 = $.ensure_array_like($.store_get($$store_subs ??= {}, "$items", items));
		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let { c } = each_array_2[$$index_2];
			$$renderer.push(`<input${$.attr("value", c.v)}/>`);
		}
		$$renderer.push(`<!--]-->`);
		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
