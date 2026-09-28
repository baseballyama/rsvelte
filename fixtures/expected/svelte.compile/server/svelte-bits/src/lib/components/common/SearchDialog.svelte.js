import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { CATEGORIES, slug } from '$lib/constants/categories';
import { fuzzyMatch } from '$lib/utils/fuzzy';

export default function SearchDialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { isOpen = false, onClose, onToggle } = $$props;
		let inputValue = '';
		let searchValue = '';
		let topGradientOpacity = 0;
		let bottomGradientOpacity = 1;
		let selectedIndex = -1;
		let keyboardNav = false;
		let resultsRef = null;
		let inputRef = null;
		let dialogRef = null;
		let previouslyFocused = null;
		const listboxId = 'component-search-results';

		function searchComponents(query) {
			if (!query || query.trim() === '') return [];

			const results = [];

			CATEGORIES.forEach(({ name: categoryName, subcategories }) => {
				if (fuzzyMatch(categoryName, query)) {
					subcategories.forEach((componentName) => results.push({ categoryName, componentName }));
				} else {
					subcategories.forEach((componentName) => {
						if (fuzzyMatch(componentName, query)) results.push({ categoryName, componentName });
					});
				}
			});

			return results;
		}

		const results = $.derived(() => searchComponents(searchValue));

		function handleScroll(e) {
			const target = e.currentTarget;
			const { scrollTop, scrollHeight, clientHeight } = target;

			topGradientOpacity = Math.min(scrollTop / 50, 1);

			const bottomDist = scrollHeight - (scrollTop + clientHeight);

			bottomGradientOpacity = scrollHeight <= clientHeight ? 0 : Math.min(bottomDist / 50, 1);
		}

		function close() {
			onClose?.();
		}

		function closeFromBackdrop(e) {
			if (e.target === e.currentTarget) close();
		}

		function handleInput(e) {
			inputValue = e.currentTarget.value;
			searchValue = inputValue;
			selectedIndex = -1;
		}

		function handleInputKeydown(e) {
			if (e.key === 'ArrowDown' && results().length > 0) {
				e.preventDefault();
				keyboardNav = true;
				selectedIndex = Math.max(selectedIndex, 0);
			}
		}

		function handleResultKeydown(e, result) {
			if (e.key !== 'Enter' && e.key !== ' ') return;

			e.preventDefault();
			selectResult(result);
		}

		function selectResult(result) {
			if (!result) return;

			goto(`/${slug(result.categoryName)}/${slug(result.componentName)}`);
			inputValue = '';
			searchValue = '';
			selectedIndex = -1;
			close();
		}

		function getFocusable(container) {
			return Array.from(container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);
		}

		if (isOpen) {
			$$renderer.push(`<!--[0--><div class="search-backdrop svelte-kk6vmu" role="presentation"><div class="search-dialog svelte-kk6vmu" role="dialog" aria-modal="true" aria-label="Search" tabindex="-1"><div class="search-input-row svelte-kk6vmu"><svg class="search-input-icon svelte-kk6vmu" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg> <input class="search-input svelte-kk6vmu"${$.attr('value', inputValue)} placeholder="Search components, categories, or keywords..." role="combobox"${$.attr('aria-expanded', Boolean(searchValue))}${$.attr('aria-controls', listboxId)} aria-autocomplete="list"${$.attr('aria-activedescendant', selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined)}/> <button type="button" class="search-kbd svelte-kk6vmu">esc</button></div> `);

			if (searchValue) {
				$$renderer.push(`<!--[0--><div class="search-results-motion svelte-kk6vmu"><div class="search-results-wrapper svelte-kk6vmu"><div${$.attr('id', listboxId)} class="search-results svelte-kk6vmu" role="listbox" aria-label="Search results">`);

				if (results().length > 0) {
					$$renderer.push(`<!--[0--><!--[-->`);

					const each_array = $.ensure_array_like(results());

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let r = each_array[i];

						$$renderer.push(`<div${$.attr('id', `search-result-${$.stringify(i)}`)} class="search-result-anim svelte-kk6vmu"${$.attr('data-index', i)} role="option"${$.attr('aria-selected', selectedIndex === i)} tabindex="-1"><div${$.attr_class(`search-result-item${selectedIndex === i ? ' selected' : ''}`, 'svelte-kk6vmu')}><div class="search-result-icon svelte-kk6vmu">`);

						if (r.categoryName === 'Text Animations') {
							$$renderer.push(`<!--[0--><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3"></path><path d="M9 20h6"></path><path d="M12 4v16"></path></svg>`);
						} else if (r.categoryName === 'Components') {
							$$renderer.push(`<!--[1--><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5Z"></path><path d="m2 17 10 5 10-5"></path><path d="m2 12 10 5 10-5"></path></svg>`);
						} else if (r.categoryName === 'Backgrounds') {
							$$renderer.push(`<!--[2--><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"></path></svg>`);
						} else if (r.categoryName === 'Animations') {
							$$renderer.push(`<!--[3--><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path><path d="m12 8 4 4-4 4"></path></svg>`);
						} else {
							$$renderer.push(`<!--[-1--><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"></path><path d="M14 2v6h6"></path></svg>`);
						}

						$$renderer.push(`<!--]--></div> <div class="search-result-text svelte-kk6vmu"><span class="search-result-name svelte-kk6vmu">${$.escape(r.componentName)}</span> <span class="search-result-category svelte-kk6vmu">in ${$.escape(r.categoryName)}</span></div> <div class="search-result-enter svelte-kk6vmu"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 4v7a4 4 0 0 1-4 4H5"></path><path d="m9 11-4 4 4 4"></path></svg></div></div></div>`);
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push(`<!--[-1--><p class="search-no-results svelte-kk6vmu">No results found for <strong class="svelte-kk6vmu">${$.escape(searchValue)}</strong></p>`);
				}

				$$renderer.push(`<!--]--></div> <div class="search-gradient search-gradient-top svelte-kk6vmu"${$.attr_style('', { opacity: topGradientOpacity })}></div> <div class="search-gradient search-gradient-bottom svelte-kk6vmu"${$.attr_style('', { opacity: bottomGradientOpacity })}></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}