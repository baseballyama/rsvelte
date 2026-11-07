import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	/** @type {{ a: A; b: B; c: C }} */
	function getA() {
		return $$props.a;
	}

	var $$exports = { getA };

	return $.pop($$exports);
}