import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function RunesGeneric($$anchor, $$props) {
	$.push($$props, true);

	function only_bind() {
		return true;
	}

	var $$exports = { only_bind };

	return $.pop($$exports);
}