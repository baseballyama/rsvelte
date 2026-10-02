import * as $ from 'svelte/internal/server';
import { state, effect } from './store.js';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let foo = $.store_get($$store_subs ??= {}, '$state', state)(0); // foo = 1

		$.store_get($$store_subs ??= {}, '$effect', effect)(() => {
			throw new Error('Shouldnt be called');
		});

		function bar($derived, $effect) {
			const x = $derived(foo + 1); // x = 3

			$effect(() => {
				throw new Error('Shouldnt be called');
			});

			return {
				get x() {
					return x + $derived(0); /* == 4 */
				},

				get y() {
					return $effect(() => {
						throw new Error('Shouldnt be called');
					}); /* == 0 */
				}
			};
		}

		const baz = bar($.store_get($$store_subs ??= {}, '$state', state), $.store_get($$store_subs ??= {}, '$effect', effect));

		$$renderer.push(`<p>${$.escape(foo)} ${$.escape(baz.x)} ${$.escape(baz.y)}</p> <button>Shouldnt be reactive</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}