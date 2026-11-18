import * as $ from "svelte/internal/server";
import { writable } from "svelte/store";
export default function Store_order($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const a = writable(1);
		const b = writable(2);
		const c = writable(3);
		const tag = writable("div");
		const xs = writable([]);
		const action = writable(() => {});
		function s($$renderer) {
			$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, "$a", a))}`);
		}
		$.element($$renderer, $.store_get($$store_subs ??= {}, "$tag", tag), void 0, () => {
			$$renderer.push(`${$.escape($.store_get($$store_subs ??= {}, "$a", a))}`);
		});
		$$renderer.push(` `);
		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, "$xs", xs));
		if (each_array.length !== 0) {
			$$renderer.push("<!--[-->");
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let x = each_array[$$index];
				$$renderer.push(`<!---->${$.escape(x)}`);
			}
		} else {
			$$renderer.push(`<!--[!--><!---->${$.escape($.store_get($$store_subs ??= {}, "$c", c))}`);
		}
		$$renderer.push(`<!--]--> <p>${$.escape($.store_get($$store_subs ??= {}, "$b", b))}</p> `);
		s($$renderer);
		$$renderer.push(`<!---->`);
		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
