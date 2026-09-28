import * as $ from 'svelte/internal/server';
import { Badge, Icon, Spinner } from '@appwrite.io/pink-svelte';
import { IconPlus, IconPencil, IconCheck, IconExclamationCircle } from '@appwrite.io/pink-icons-svelte';
import { InputSearch } from '$lib/elements/forms';
import { WILDCARD_IDENTIFIER } from '$lib/helpers/oauth2-authorization-details';

export default function Resource_selector($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const PAGE_SIZE = 8;

		/** Plural label, e.g. `projects`. */
		/** Identifiers the client requested (may be `['*']`). Defines the universe. */
		/** Current selection (`['*']` = all). Two-way bound to the parent. */
		/** Paginated live search over the selectable universe. */
		/** Resolve specific requested ids to display names. */
		let {
			pluralLabel,
			requested,
			selected = void 0,
			find,
			resolveNames,
			disabled = false
		} = $$props;

		const wildcard = $.derived(() => requested.includes(WILDCARD_IDENTIFIER));
		const isAll = $.derived(() => selected.includes(WILDCARD_IDENTIFIER));
		const specificIds = $.derived(() => selected.filter((id) => id !== WILDCARD_IDENTIFIER));

		// Nothing selected — the tier grants nothing until the user picks a resource.
		const isEmpty = $.derived(() => !isAll() && specificIds().length === 0);

		// Whether the current selection still matches exactly what was requested.
		const isDefault = $.derived(() => selected.length === requested.length && selected.every((id) => requested.includes(id)));

		// Search (which can *add* resources) is only offered when narrowing a
		// wildcard grant — every match is still within the requested `*`, so it stays
		// downscope-only. A specific requested list is fixed: the user can remove
		// from it but never add resources the client didn't ask for.
		const searchable = $.derived(() => wildcard() && !isAll());

		let expanded = false;
		let names = {};
		let term = '';
		let results = [];
		let searching = false;
		let loadingMore = false;
		let hasMore = false;

		function labelFor(id) {
			return names[id] ?? { id, name: id, resolved: false };
		}

		// Resolve the requested specific ids so chips show real names.
		// Debounced live search while the picker is open and searchable.
		async function loadMore() {
			if (searching || loadingMore || !hasMore) return;

			const currentTerm = term;
			const offset = results.length;

			loadingMore = true;

			try {
				const page = await find(currentTerm, offset, PAGE_SIZE);

				if (currentTerm !== term) return;

				const seen = new Set(results.map((resource) => resource.id));
				const next = page.resources.filter((resource) => !seen.has(resource.id));

				results = [...results, ...next];
				hasMore = page.hasMore;

				const merged = { ...names };

				for (const resource of next) merged[resource.id] = resource;

				names = merged;
			} finally {
				loadingMore = false;
			}
		}

		function handleResultsScroll(event) {
			const list = event.currentTarget;

			if (list.scrollTop + list.clientHeight >= list.scrollHeight - 24) {
				void loadMore();
			}
		}

		const suggestions = $.derived(() => results.filter((r) => !selected.includes(r.id)));

		function setAll(all) {
			selected = all ? [WILDCARD_IDENTIFIER] : [];
		}

		function add(id) {
			if (selected.includes(id)) return;

			selected = [...selected.filter((x) => x !== WILDCARD_IDENTIFIER), id];

			if (hasMore) queueMicrotask(() => void loadMore());
		}

		function remove(id) {
			selected = selected.filter((x) => x !== id);
		}

		const summary = $.derived(() => {
			if (isAll()) return `All ${pluralLabel}`;
			if (specificIds().length === 0) return `No ${pluralLabel} selected`;
			if (specificIds().length <= 2) return specificIds().map((id) => labelFor(id).name).join(', ');

			return `${specificIds().length} ${pluralLabel}`;
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="selector svelte-jbm919"><div class="summary-row svelte-jbm919"><span${$.attr_class('summary svelte-jbm919', void 0, { 'empty': isEmpty() })}>`);

			if (isEmpty()) {
				$$renderer.push('<!--[0-->');
				Icon($$renderer, { icon: IconExclamationCircle, size: 's' });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <span class="summary-text svelte-jbm919">${$.escape(summary())}</span> `);

			if (isDefault()) {
				$$renderer.push(`<!--[0--><span class="default-tag svelte-jbm919">Default</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></span> <button type="button"${$.attr_class('toggle svelte-jbm919', void 0, { 'active': expanded })}${$.attr('disabled', disabled, true)}>`);
			Icon($$renderer, { icon: expanded ? IconCheck : IconPencil, size: 's' });
			$$renderer.push(`<!----> ${$.escape(expanded ? 'Done' : 'Change')}</button></div> `);

			if (expanded) {
				$$renderer.push(`<!--[0--><div class="body svelte-jbm919">`);

				if (wildcard()) {
					$$renderer.push(`<!--[0--><div class="mode svelte-jbm919" role="group"><button type="button"${$.attr_class('seg svelte-jbm919', void 0, { 'active': isAll() })}${$.attr('disabled', disabled, true)}>All ${$.escape(pluralLabel)}</button> <button type="button"${$.attr_class('seg svelte-jbm919', void 0, { 'active': !isAll() })}${$.attr('disabled', disabled, true)}>Specific ${$.escape(pluralLabel)}</button></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (specificIds().length > 0) {
					$$renderer.push(`<!--[0--><div class="chips svelte-jbm919"><!--[-->`);

					const each_array = $.ensure_array_like(specificIds());

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let id = each_array[$$index];
						const r = labelFor(id);

						$$renderer.push(`<span class="chip svelte-jbm919"><span${$.attr_class('chip-name svelte-jbm919', void 0, { 'mono': !r.resolved })}>${$.escape(r.name)}</span> `);

						if (r.region) {
							$$renderer.push('<!--[0-->');
							Badge($$renderer, { size: 'xs', variant: 'secondary', content: r.region });
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <button type="button" class="chip-remove svelte-jbm919"${$.attr('aria-label', `Remove ${r.name}`)}${$.attr('disabled', disabled, true)}>×</button></span>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (searchable()) {
					$$renderer.push('<!--[0-->');

					InputSearch($$renderer, {
						placeholder: `Search ${pluralLabel} by name`,
						disabled,
						get value() {
							return term;
						},

						set value($$value) {
							term = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> <ul class="results svelte-jbm919">`);

					if (searching) {
						$$renderer.push(`<!--[0--><li class="results-state svelte-jbm919">`);
						Spinner($$renderer, { size: 's' });
						$$renderer.push(`<!----></li>`);
					} else if (suggestions().length === 0) {
						$$renderer.push(`<!--[1--><li class="results-state svelte-jbm919">${$.escape(term.trim()
							? `No matching ${pluralLabel}`
							: `Type to search ${pluralLabel}`)}</li>`);
					} else {
						$$renderer.push(`<!--[-1--><!--[-->`);

						const each_array_1 = $.ensure_array_like(suggestions());

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let r = each_array_1[$$index_1];

							$$renderer.push(`<li class="svelte-jbm919"><button type="button" class="result svelte-jbm919"${$.attr('disabled', disabled, true)}><span class="result-text svelte-jbm919"><span class="result-name svelte-jbm919">${$.escape(r.name)}</span> `);

							if (r.region) {
								$$renderer.push('<!--[0-->');
								Badge($$renderer, { size: 'xs', variant: 'secondary', content: r.region });
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></span> `);
							Icon($$renderer, { icon: IconPlus, size: 's' });
							$$renderer.push(`<!----></button></li>`);
						}

						$$renderer.push(`<!--]--> `);

						if (loadingMore) {
							$$renderer.push(`<!--[0--><li class="results-state svelte-jbm919">`);
							Spinner($$renderer, { size: 's' });
							$$renderer.push(`<!----></li>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]--></ul>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { selected });
	});
}