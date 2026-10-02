import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _5_input($$anchor, $$props) {
	$.push($$props, true);

	let className;

	var $$exports = {
		get class() {
			return className;
		},

		set class($$value) {
			className = $$value;
		}
	};

	return $.pop($$exports);
}