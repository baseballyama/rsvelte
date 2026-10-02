import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	let name = "world";
	let name2 = "world";

	var $$exports = {
		get name3() {
			return name;
		},

		set name3($$value) {
			name = $$value;
		},

		get name4() {
			return name2;
		},

		set name4($$value) {
			name2 = $$value;
		}
	};

	return $.pop($$exports);
}