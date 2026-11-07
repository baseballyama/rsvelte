import * as $ from 'svelte/internal/server';

export default function Trigger($$renderer, $$props) {
	function action() {
		return () => {};
	}

	$.bind_props($$props, { action });
}