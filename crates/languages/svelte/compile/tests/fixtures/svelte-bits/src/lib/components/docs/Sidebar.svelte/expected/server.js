import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { CATEGORIES, NEW, UPDATED, slug, isImplemented } from '$lib/constants/categories';
import { onMount } from 'svelte';
import { getSavedComponents } from '$lib/utils/favorites';

export default function Sidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { onnavigate } = $$props;
		let scrollEl = null;
		let savedSet = new Set();
		const activeCategory = $.derived(() => page.params.category ?? '');
		const activeSub = $.derived(() => page.params.subcategory ?? '');

		function isActive(cat, sub) {
			return slug(cat) === activeCategory() && slug(sub) === activeSub();
		}

		function loadSaved() {
			savedSet = new Set(getSavedComponents());
		}

		onMount(() => {
			loadSaved();

			const onStorage = (e) => {
				if (!e.key || e.key === 'savedComponents') loadSaved();
			};

			window.addEventListener('favorites:updated', loadSaved);
			window.addEventListener('storage', onStorage);

			return () => {
				window.removeEventListener('favorites:updated', loadSaved);
				window.removeEventListener('storage', onStorage);
			};
		});

		$$renderer.push(`<aside class="sidebar" aria-label="Docs navigation"><div class="sidebar-inner"><div class="sidebar-cat-list"><!--[-->`);

		const each_array = $.ensure_array_like(CATEGORIES);

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let cat = each_array[$$index_1];

			$$renderer.push(`<div><p${$.attr('id', `sidebar-${$.stringify(slug(cat.name))}`)} class="category-name">${$.escape(cat.name)}</p> <div class="sidebar-stack" role="list"${$.attr('aria-labelledby', `sidebar-${$.stringify(slug(cat.name))}`)}><!--[-->`);

			const each_array_1 = $.ensure_array_like(cat.subcategories);

			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let sub = each_array_1[$$index];
				const implemented = isImplemented(sub);
				const favoriteKey = `${cat.name}/${sub}`;

				$$renderer.push(`<a${$.attr_class(`sidebar-item ${isActive(cat.name, sub) ? 'active' : ''} ${implemented ? '' : 'unimplemented'}`)}${$.attr('href', `/${$.stringify(slug(cat.name))}/${$.stringify(slug(sub))}`)}${$.attr('aria-current', isActive(cat.name, sub) ? 'page' : undefined)}><span>${$.escape(sub)}</span> `);

				if (savedSet.has(favoriteKey)) {
					$$renderer.push(`<!--[0--><svg class="favorite-sidebar-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"></path></svg>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (!implemented) {
					$$renderer.push(`<!--[0--><span class="help-tag">Help</span>`);
				} else if (NEW.includes(sub)) {
					$$renderer.push(`<!--[1--><span class="new-tag">New</span>`);
				} else if (UPDATED.includes(sub)) {
					$$renderer.push(`<!--[2--><span class="updated-tag">Updated</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></a>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div></aside>`);
	});
}