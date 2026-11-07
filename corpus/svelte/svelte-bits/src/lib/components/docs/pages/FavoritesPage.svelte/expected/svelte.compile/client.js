import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import ComponentList from '$lib/components/docs/ComponentList.svelte';
import { COMPONENT_INDEX_ITEMS } from '$lib/constants/componentIndex';
import { getSavedComponents } from '$lib/utils/favorites';

export default function FavoritesPage($$anchor, $$props) {
	$.push($$props, true);

	let savedKeys = $.state($.proxy([]));
	const savedItems = $.derived(() => $.get(savedKeys).map((key) => COMPONENT_INDEX_ITEMS.find((item) => item.key === key)).filter((item) => Boolean(item)));

	function update() {
		$.set(savedKeys, getSavedComponents(), true);
	}

	onMount(() => {
		update();

		const onStorage = (e) => {
			if (!e.key || e.key === 'savedComponents') update();
		};

		window.addEventListener('favorites:updated', update);
		window.addEventListener('storage', onStorage);

		return () => {
			window.removeEventListener('favorites:updated', update);
			window.removeEventListener('storage', onStorage);
		};
	});

	$.head('3xo23v', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Svelte Bits - Favorites';
		});
	});

	ComponentList($$anchor, {
		title: 'Favorites',
		get items() {
			return $.get(savedItems);
		},
		hasDeleteButton: true,
		emptyTitle: 'Nothing here yet...',
		emptyDescription: 'Tap the heart on any component to save it'
	});

	$.pop();
}