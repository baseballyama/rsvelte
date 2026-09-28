import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createSubscriber } from 'svelte/reactivity';

var root = $.from_html(`<button>+</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class MyStore {
		#subscribe;
		#data = $.state($.proxy([['a', [1, 2]], ['b', [3, 4]]]));
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

			return $.get(this.#data);
		}

		set data(v) {
			$.set(this.#data, v, true);
		}
	}

	let storeOptions = $.proxy({ someBoolean: false, id: 0 });
	let myStore = $.derived(() => new MyStore(storeOptions));
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.each(node, 17, () => $.get(myStore).data, $.index, ($$anchor, _) => {});

	$.delegated('click', button, () => {
		storeOptions.someBoolean = !storeOptions.someBoolean;
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);