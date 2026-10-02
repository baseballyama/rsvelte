import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Props04_input($$anchor, $$props) {
	$.push($$props, true);

	let prop;

	var $$exports = {
		get prop() {
			return prop;
		},

		set prop($$value) {
			prop = $$value;
		}
	};

	return $.pop($$exports);
}