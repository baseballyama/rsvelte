import * as $ from 'svelte/internal/server';
import ComponentList from '$lib/components/docs/ComponentList.svelte';
import { COMPONENT_INDEX_ITEMS } from '$lib/constants/componentIndex';

export default function IndexPage($$renderer) {
	$.head('m7j9zw', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Svelte Bits - Component Index</title>`);
		});
	});

	ComponentList($$renderer, { title: 'Index', items: COMPONENT_INDEX_ITEMS });
}