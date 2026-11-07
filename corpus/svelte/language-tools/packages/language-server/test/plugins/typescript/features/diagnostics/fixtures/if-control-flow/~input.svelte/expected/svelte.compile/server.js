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
		const aNestedPromise = null;
		const store = writable(true);

		if (typeof a === 'string') {
			$$renderer.push(`<!--[0-->true
    ${$.escape(assignA = a)} `);

			const each_array = $.ensure_array_like([]);

			if (each_array.length !== 0) {
				$$renderer.push('<!--[-->');

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let foo = each_array[$$index];

					$$renderer.push(`<!---->true
        ${$.escape(assignA = a)}
        ${$.escape(foo)}`);
				}
			} else {
				$$renderer.push(`<!--[!--><!---->true
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
					(x) => {
						$$renderer.push(`${$.escape(b.a === x)}`);
					}
				);

				$$renderer.push(`<!--]--> ${$.escape(b.a)}`);
			} else {
				$$renderer.push(`<!--[-1-->false `);

				Comp($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { foo }) => {
							$$renderer.push(`<!---->${$.escape(b.a === foo)} `);

							if (typeof foo === 'boolean') {
								$$renderer.push(`<!--[0-->${$.escape(foo === a)}`);
							} else {
								$$renderer.push(`<!--[-1-->${$.escape(foo === a)}`);
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
					let foo = each_array_1[$$index_1];

					$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$store', store) === a)}
            ${$.escape(foo)}`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape($.store_get($$store_subs ??= {}, '$store', store) === a)}`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--> true
${$.escape(assignA = a)} `);

		$.await($$renderer, aNestedPromise.p, () => {}, (x) => {
			$$renderer.push(`${$.escape(x)}`);
		});

		$$renderer.push(`<!--]--> `);

		if (aNestedPromise) {
			$$renderer.push('<!--[0-->');

			$.await($$renderer, aNestedPromise.p, () => {}, (x) => {
				$$renderer.push(`${$.escape(x)}`);
			});

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}