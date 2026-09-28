import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Delete</button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	function createState(init) {
		let values = $.proxy(init);

		return {
			get value() {
				return $.snapshot(values);
			},

			get workedValues() {
				let newValue = [];

				for (const value of values) {
					if (value === undefined) {
						throw new Error('undefined found');
					}

					newValue.push(value);
				}

				return newValue;
			},

			doSplice() {
				values.splice(0, 1);
			}
		};
	}

	const myState = createState([1, 2, 3, 7]);

	;;

	var button = root();

	$.delegated('click', button, () => myState.doSplice());
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);