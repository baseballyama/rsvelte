import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer, $$props) {
	const components = {};

	function get_first() {
		return components.first;
	}

	Child($$renderer, {});
	$.bind_props($$props, { get_first });
}