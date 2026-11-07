import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import ComponentList from '$lib/components/docs/ComponentList.svelte';
import { COMPONENT_INDEX_ITEMS } from '$lib/constants/componentIndex';
import { getSavedComponents } from '$lib/utils/favorites';

export default function FavoritesPage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let savedKeys = [];
		const savedItems = $.derived(() => savedKeys.map((key) => COMPONENT_INDEX_ITEMS.find((item) => item.key === key)).filter((item) => Boolean(item)));

		function update() {
			savedKeys = getSavedComponents();
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

		$.head('3xo23v', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Svelte Bits - Favorites</title>`);
			});
		});

		ComponentList($$renderer, {
			title: 'Favorites',
			items: savedItems(),
			hasDeleteButton: true,
			emptyTitle: 'Nothing here yet...',
			emptyDescription: 'Tap the heart on any component to save it'
		});
	});
}