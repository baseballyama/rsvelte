import * as $ from 'svelte/internal/server';
import { writable } from "svelte/store";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let store = writable([{ value: 1 }]);
		let storeDeeper = writable({ items: [{ value: 1 }] });

		function increment() {
			$.store_get($$store_subs ??= {}, '$store', store)[0].value++;
			$.store_get($$store_subs ??= {}, '$storeDeeper', storeDeeper).items[0].value++;
		}

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$store', store));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<!---->${$.escape(item.value)}`);
		}

		$$renderer.push(`<!--]--> <!--[-->`);

		const each_array_1 = $.ensure_array_like($.store_get($$store_subs ??= {}, '$storeDeeper', storeDeeper).items);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let item = each_array_1[$$index_1];

			$$renderer.push(`<!---->${$.escape(item.value)}`);
		}

		$$renderer.push(`<!--]--> <!--[-->`);

		const each_array_2 = $.ensure_array_like($.store_get($$store_subs ??= {}, '$store', store));

		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let item = each_array_2[$$index_2];

			$$renderer.push(`<!---->${$.escape(item.value)}`);
		}

		$$renderer.push(`<!--]--> <!--[-->`);

		const each_array_3 = $.ensure_array_like($.store_get($$store_subs ??= {}, '$storeDeeper', storeDeeper).items);

		for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
			let item = each_array_3[$$index_3];

			$$renderer.push(`<!---->${$.escape(item.value)}`);
		}

		$$renderer.push(`<!--]--> <button>+</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}