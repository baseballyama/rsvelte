import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ComponentList from '$lib/components/docs/ComponentList.svelte';
import { COMPONENT_INDEX_ITEMS } from '$lib/constants/componentIndex';

export default function IndexPage($$anchor) {
	$.head('m7j9zw', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Svelte Bits - Component Index';
		});
	});

	ComponentList($$anchor, {
		title: 'Index',
		get items() {
			return COMPONENT_INDEX_ITEMS;
		}
	});
}