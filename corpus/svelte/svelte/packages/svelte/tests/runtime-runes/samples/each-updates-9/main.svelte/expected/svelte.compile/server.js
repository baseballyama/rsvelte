import * as $ from 'svelte/internal/server';
import { createSubscriber } from 'svelte/reactivity';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class MyStore {
			#subscribe;
			#data = [['a', [1, 2]], ['b', [3, 4]]];
			#id;

			constructor(options) {
				options?.someBoolean;
				this.#id = options?.id;

				this.#subscribe = createSubscriber(() => {
					debugger;

					return () => {
						console.log('cleanup');
					};
				});
			}

			get data() {
				this.#subscribe();

				return this.#data;
			}

			set data(v) {
				this.#data = v;
			}
		}

		let storeOptions = { someBoolean: false, id: 0 };
		let myStore = $.derived(() => new MyStore(storeOptions));

		$$renderer.push(`<button>+</button> <!--[-->`);

		const each_array = $.ensure_array_like(myStore().data);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let _ = each_array[$$index];
		}

		$$renderer.push(`<!--]-->`);
	});
}