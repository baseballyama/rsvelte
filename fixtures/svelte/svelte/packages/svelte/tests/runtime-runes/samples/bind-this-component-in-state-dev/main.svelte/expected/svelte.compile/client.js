import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const components = $.proxy({});

	function get_first() {
		return components.first;
	}

	var $$exports = { get_first };

	$.bind_this(Child($$anchor, {}), ($$value) => components.first = $$value, () => components?.first);

	return $.pop($$exports);
}