import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Trigger($$anchor, $$props) {
	$.push($$props, true);

	function action() {
		return () => {};
	}

	var $$exports = { action };

	return $.pop($$exports);
}