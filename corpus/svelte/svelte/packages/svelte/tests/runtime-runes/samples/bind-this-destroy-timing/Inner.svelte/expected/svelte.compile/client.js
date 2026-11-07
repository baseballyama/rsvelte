import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Inner($$anchor, $$props) {
	$.push($$props, true);

	const processed = $.derived(() => $$props.data.toUpperCase());

	function getProcessed() {
		return $.get(processed);
	}

	var $$exports = { getProcessed };

	return $.pop($$exports);
}