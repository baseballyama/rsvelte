import * as $ from "svelte/internal/server";
import { writable } from "svelte/store";
import Child from "./Child.svelte";
export default function Store_bindings($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const count = writable(0);
		const obj = writable({
			a: 1,
			list: [{ v: 1 }]
		});
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			$$renderer.push(`<input${$.attr("value", $.store_get($$store_subs ??= {}, "$count", count))}/> <input${$.attr("value", $.store_get($$store_subs ??= {}, "$obj", obj).a)}/> `);
			Child($$renderer, {
				get value() {
					return $.store_get($$store_subs ??= {}, "$count", count);
				},
				set value($$value) {
					$.store_set(count, $$value);
					$$settled = false;
				},
				get other() {
					return $.store_get($$store_subs ??= {}, "$obj", obj).a;
				},
				set other($$value) {
					$.store_mutate($$store_subs ??= {}, "$obj", obj, $.store_get($$store_subs ??= {}, "$obj", obj).a = $$value);
					$$settled = false;
				}
			});
			$$renderer.push(`<!----> <!--[-->`);
			const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, "$obj", obj).list);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];
				$$renderer.push(`<input${$.attr("value", item.v)}/>`);
			}
			$$renderer.push(`<!--]--> <button>x</button>`);
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
