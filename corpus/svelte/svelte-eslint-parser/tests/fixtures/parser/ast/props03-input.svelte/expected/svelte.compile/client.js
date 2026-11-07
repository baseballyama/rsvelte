import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Props03_input($$anchor, $$props) {
	$.push($$props, true);

	let prop;

	var $$exports = {
		get x() {
			return prop;
		},

		set x($$value) {
			prop = $$value;
		}
	};

	return $.pop($$exports);
}