import * as $ from 'svelte/internal/server';
import { get, writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let bagOlStores = writable([1, 2, 3, writable(4), writable(5), writable(6)]);
		let firstNonStore;
		let secondNonStore;
		let thirdNonStore;
		let firstStore;
		let secondStore;
		let thirdStore;

		[
			firstNonStore,
			secondNonStore,
			thirdNonStore,
			firstStore,
			secondStore,
			thirdStore
		] = $.store_get($$store_subs ??= {}, '$bagOlStores', bagOlStores);

		function changeStores() {
			$.store_set(bagOlStores, (($$value) => {
				var $$array_1 = $.to_array($$value, 6);

				firstNonStore = $$array_1[0];
				secondNonStore = $$array_1[1];
				thirdNonStore = $$array_1[2];
				firstStore = $$array_1[3];
				$.store_set(secondStore, $$array_1[4]);
				thirdStore = $$array_1[5];

				return $$value;
			})([
				7,
				8,
				9,
				writable(10),
				11,
				writable(12),
				writable(14),
				writable(15)
			]));
		}

		$$renderer.push(`<p>${$.escape(firstNonStore)}</p> <p>${$.escape(secondNonStore)}</p> <p>${$.escape(thirdNonStore)}</p> <p>${$.escape($.store_get($$store_subs ??= {}, '$firstStore', firstStore))}</p> <p>${$.escape($.store_get($$store_subs ??= {}, '$secondStore', secondStore))}</p> <p>${$.escape($.store_get($$store_subs ??= {}, '$thirdStore', thirdStore))}</p> <h1>Bag'ol stores</h1> <p>${$.escape(get($.store_get($$store_subs ??= {}, '$bagOlStores', bagOlStores)[5]))}</p> <p>${$.escape(get($.store_get($$store_subs ??= {}, '$bagOlStores', bagOlStores)[6]))}</p> <p>${$.escape(get($.store_get($$store_subs ??= {}, '$bagOlStores', bagOlStores)[7]))}</p> <button>Click me!</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}