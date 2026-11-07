import * as $ from 'svelte/internal/server';
import Comp from './diagnostics-if-control-flow-imported.svelte';
import { writable } from 'svelte/store';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let a = true;
		let b = undefined;
		let assignA = '';

		assignA;

		const aPromise = Promise.resolve(true);
		const store = writable(true);

		if (typeof a === 'string') {
			$$renderer.push(`<!--[0-->true
    ${$.escape(assignA = a)} <!--[-->`);

			const each_array = $.ensure_array_like([true]);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let a = each_array[$$index];

				$$renderer.push(`<!---->${$.escape(a === true)}
        ${$.escape(assignA = a)}`);
			}

			$$renderer.push(`<!--]--> `);

			if (b) {
				$$renderer.push('<!--[0-->');

				$.await(
					$$renderer,
					aPromise,
					() => {
						$$renderer.push(`${$.escape(b.a)}`);
					},
					(b) => {
						$$renderer.push(`${$.escape(b.a)}`);
					}
				);

				$$renderer.push(`<!--]--> ${$.escape(b.a)}`);
			} else {
				$$renderer.push(`<!--[-1-->false `);

				Comp($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { b }) => {
							$$renderer.push(`<!---->${$.escape(b.a)} `);

							if (typeof b === 'boolean') {
								$$renderer.push(`<!--[0-->${$.escape(a === b)}`);
							} else {
								$$renderer.push(`<!--[-1-->${$.escape(a === b)}`);
							}

							$$renderer.push(`<!--]-->`);
						}
					}
				});

				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');

			if (typeof $.store_get($$store_subs ??= {}, '$store', store) === 'string') {
				$$renderer.push(`<!--[0--><!--[-->`);

				const each_array_1 = $.ensure_array_like([]);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let a = each_array_1[$$index_1];

					$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$store', store) === a)}`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape($.store_get($$store_subs ??= {}, '$store', store) === a)}`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}