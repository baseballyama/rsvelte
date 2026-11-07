import * as $ from 'svelte/internal/server';
import { writable } from "svelte/store";
import Tab from "./Tab.svelte";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let i = 0;
		const { set, subscribe } = writable({ id: 1, name: "tab1" });

		const tab = {
			set(value) {
				i++;
				set(value);
			},
			subscribe
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Tab($$renderer, {
				get tab() {
					return $.store_get($$store_subs ??= {}, '$tab', tab);
				},

				set tab($$value) {
					$.store_set(tab, $$value);
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <p>${$.escape(i)}</p>`);
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