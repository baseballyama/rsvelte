import * as $ from 'svelte/internal/server';
import { get, writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let bagOlStores = writable({
			firstNonStore: 1,
			secondNonStore: 2,
			thirdNonStore: 3,
			firstStore: writable(4),
			secondStore: writable(5),
			thirdStore: writable(6)
		});

		let {
			firstNonStore,
			secondNonStore,
			thirdNonStore,
			firstStore,
			secondStore,
			thirdStore
		} = $.store_get($$store_subs ??= {}, '$bagOlStores', bagOlStores);

		function changeStores() {
			$.store_set(bagOlStores, (($$value) => {
				thirdStore = $$value.thirdStore;
				$.store_set(secondStore, $$value.$secondStore);
				$.store_set(firstStore, $$value.$firstStore);
				firstNonStore = $$value.firstNonStore;
				secondNonStore = $$value.secondNonStore;
				thirdNonStore = $$value.thirdNonStore;

				return $$value;
			})({
				firstNonStore: 7,
				secondNonStore: 8,
				thirdNonStore: 9,
				$firstStore: 10,
				$secondStore: 11,
				firstStore: writable(14),
				secondStore: writable(13),
				thirdStore: writable(12)
			}));
		}

		$$renderer.push(`<p>${$.escape(firstNonStore)}</p> <p>${$.escape(secondNonStore)}</p> <p>${$.escape(thirdNonStore)}</p> <p>${$.escape($.store_get($$store_subs ??= {}, '$firstStore', firstStore))}</p> <p>${$.escape($.store_get($$store_subs ??= {}, '$secondStore', secondStore))}</p> <p>${$.escape($.store_get($$store_subs ??= {}, '$thirdStore', thirdStore))}</p> <h1>Bag'ol stores</h1> <p>${$.escape(get($.store_get($$store_subs ??= {}, '$bagOlStores', bagOlStores).firstStore))}</p> <p>${$.escape(get($.store_get($$store_subs ??= {}, '$bagOlStores', bagOlStores).secondStore))}</p> <p>${$.escape(get($.store_get($$store_subs ??= {}, '$bagOlStores', bagOlStores).thirdStore))}</p> <button>Click me!</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}