import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';
import { Component } from './components';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const storeNr = writable(1);
		const storeBool = writable(true);
		const storeObjNr = writable({ foo: 1 });
		const storeObjBool = writable({ foo: true });
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div></div> `);

			Component($$renderer, {
				get prop() {
					return $.store_get($$store_subs ??= {}, '$storeNr', storeNr);
				},

				set prop($$value) {
					$.store_set(storeNr, $$value);
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div></div> `);

			Component($$renderer, {
				get prop() {
					return $.store_get($$store_subs ??= {}, '$storeObjNr', storeObjNr).foo;
				},

				set prop($$value) {
					$.store_mutate($$store_subs ??= {}, '$storeObjNr', storeObjNr, $.store_get($$store_subs ??= {}, '$storeObjNr', storeObjNr).foo = $$value);
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div></div> `);

			Component($$renderer, {
				get prop() {
					return $.store_get($$store_subs ??= {}, '$storeBool', storeBool);
				},

				set prop($$value) {
					$.store_set(storeBool, $$value);
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div></div> `);

			Component($$renderer, {
				get prop() {
					return $.store_get($$store_subs ??= {}, '$storeObjBool', storeObjBool).foo;
				},

				set prop($$value) {
					$.store_mutate($$store_subs ??= {}, '$storeObjBool', storeObjBool, $.store_get($$store_subs ??= {}, '$storeObjBool', storeObjBool).foo = $$value);
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
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