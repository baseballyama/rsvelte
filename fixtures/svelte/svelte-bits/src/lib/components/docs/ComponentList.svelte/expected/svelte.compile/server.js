import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

import {
	getSavedComponents,
	removeSavedComponent,
	toggleSavedComponent
} from '$lib/utils/favorites';

import { fuzzyMatch } from '$lib/utils/fuzzy';

export default function ComponentList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			title,
			items,
			hasDeleteButton = false,
			emptyTitle,
			emptyDescription
		} = $$props;

		const CARD_RADIUS = 16;

		const categoryOptions = $.derived(() => [
			'All Components',
			...Array.from(new Set(items.map((item) => item.categoryLabel))).sort((a, b) => a.localeCompare(b))
		]);

		let search = '';
		let selectedCategory = 'All Components';
		let hoveredKey = null;
		let savedSet = new Set();
		let videoRefs = new Map();

		const filtered = $.derived(() => {
			const term = search.trim();
			const all = selectedCategory === 'All Components';

			return items.filter((item) => {
				const categoryOk = all || item.categoryLabel === selectedCategory;

				if (!term) return categoryOk;

				return categoryOk && fuzzyMatch(item.title, term);
			});
		});

		const showClear = $.derived(() => selectedCategory !== 'All Components' || search.trim().length > 0);

		function loadSaved() {
			savedSet = new Set(getSavedComponents());
		}

		function toggleFavorite(key) {
			const result = toggleSavedComponent(key);

			savedSet = new Set(result.list);
		}

		function removeFavorite(key) {
			savedSet = new Set(removeSavedComponent(key));
		}

		function clearFilters() {
			search = '';
			selectedCategory = 'All Components';
		}

		function setVideo(node, key) {
			videoRefs.set(key, node);

			return {
				destroy() {
					videoRefs.delete(key);
				}
			};
		}

		function handleLoadedMetadata(e) {
			e.currentTarget.currentTime = 0.1;
		}

		onMount(() => {
			loadSaved();

			const onStorage = (e) => {
				if (!e.key || e.key === 'savedComponents') loadSaved();
			};

			const onFavorites = () => loadSaved();

			window.addEventListener('storage', onStorage);
			window.addEventListener('favorites:updated', onFavorites);

			return () => {
				window.removeEventListener('storage', onStorage);
				window.removeEventListener('favorites:updated', onFavorites);
			};
		});

		$$renderer.push(`<div class="component-list-page svelte-l89p71"><div class="component-list-header page-transition-fade svelte-l89p71"><h1 class="sub-category svelte-l89p71">${$.escape(title)}</h1> <div${$.attr_class('component-list-controls svelte-l89p71', void 0, { 'disabled': items.length === 0 })}><label class="component-list-search svelte-l89p71"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg> <input${$.attr('value', search)} placeholder="Search..."${$.attr('disabled', items.length === 0, true)} class="svelte-l89p71"/></label> <label class="component-list-select svelte-l89p71">`);

		$$renderer.select(
			{
				value: selectedCategory,
				'aria-label': 'Component category filter',
				disabled: items.length === 0,
				class: ''
			},
			($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(categoryOptions());

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let category = each_array[$$index];

					$$renderer.option({ value: category }, ($$renderer) => {
						$$renderer.push(`${$.escape(category)}`);
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			'svelte-l89p71'
		);

		$$renderer.push(` <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="svelte-l89p71"><polyline points="6 9 12 15 18 9"></polyline></svg></label> <div${$.attr_class('clear-slot svelte-l89p71', void 0, { 'show': showClear() })}><button type="button" class="clear-button svelte-l89p71" aria-label="Clear filters"${$.attr('tabindex', showClear() ? 0 : -1)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button></div></div></div> `);

		if (filtered().length === 0) {
			$$renderer.push(`<!--[0--><div class="component-list-empty svelte-l89p71" role="status"><h2 class="svelte-l89p71">${$.escape(items.length > 0 ? 'No results...' : emptyTitle ?? 'Nothing here yet...')}</h2> <p class="svelte-l89p71">${$.escape(items.length > 0
				? 'Try adjusting your filters'
				: emptyDescription ?? 'Tap the heart on any component to save it')}</p> `);

			if (items.length > 0) {
				$$renderer.push(`<!--[0--><button type="button" class="pill-button svelte-l89p71">Clear Filters</button>`);
			} else {
				$$renderer.push(`<!--[-1--><a class="pill-button svelte-l89p71" href="/get-started/index">Browse Components</a>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="component-list-grid svelte-l89p71"${$.attr_style('', { '--card-radius': `${CARD_RADIUS}px` })}><!--[-->`);

			const each_array_1 = $.ensure_array_like(filtered());

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let item = each_array_1[$$index_1];

				$$renderer.push(`<div class="component-list-card-wrap svelte-l89p71"><a class="component-list-card svelte-l89p71"${$.attr('href', item.to)}${$.attr('data-item-key', item.key)}><div class="component-list-media-wrap svelte-l89p71"><video loop="" muted="" playsinline="" preload="metadata"${$.attr('aria-label', `${item.title} preview`)} class="svelte-l89p71"><source${$.attr('src', `${item.videoBase}.webm`)} type="video/webm"/> <source${$.attr('src', `${item.videoBase}.mp4`)} type="video/mp4"/></video></div> <div class="component-list-card-copy svelte-l89p71"><h2 class="svelte-l89p71">${$.escape(item.title)}</h2> <p class="svelte-l89p71">${$.escape(item.categoryLabel)}</p></div></a> <button type="button"${$.attr_class('favorite-button svelte-l89p71', void 0, {
					'visible': savedSet.has(item.key) || hoveredKey === item.key,
					'saved': savedSet.has(item.key)
				})}${$.attr('aria-label', hasDeleteButton
					? 'Remove from favorites'
					: savedSet.has(item.key) ? 'Remove from favorites' : 'Add to favorites')}>`);

				if (hasDeleteButton) {
					$$renderer.push(`<!--[0--><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>`);
				} else {
					$$renderer.push(`<!--[-1--><svg width="14" height="14" viewBox="0 0 24 24"${$.attr('fill', savedSet.has(item.key) ? 'currentColor' : 'none')} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"></path></svg>`);
				}

				$$renderer.push(`<!--]--></button></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}