import * as $ from 'svelte/internal/server';
import { Button } from '$lib/elements/forms';
import InputSelect from '$lib/elements/forms/inputSelect.svelte';
import { projectRoles } from '$lib/stores/billing';
import { sdk } from '$lib/stores/sdk';
import { organization } from '$lib/stores/organization';
import { Query } from '@appwrite.io/console';
import { Icon, Layout, Input } from '@appwrite.io/pink-svelte';
import { IconPlus, IconTrash } from '@appwrite.io/pink-icons-svelte';
import { debounce } from '$lib/helpers/debounce';
import { onMount } from 'svelte';

export default function ProjectAccessSelector($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { projectAccess = [] } = $$props;

		// Per-row options, loading state, and request-generation counters
		let rowOptions = [];

		let rowSearching = [];

		// Incremented on every loadProjects call for a row; the response is
		// discarded if a newer request has already been dispatched.
		let rowGeneration = [];

		// Prefetch the first page the moment this component mounts (i.e. when the
		// user switches to "Specific projects") so results are ready or in-flight
		// before any row is opened.  All rows share this single Promise for
		// unfiltered loads; typed searches always hit the API separately.
		let prefetchPromise = null;

		onMount(() => {
			prefetchPromise = sdk.forConsole.organization($.store_get($$store_subs ??= {}, '$organization', organization).$id).listProjects({
				queries: [
					Query.limit(25),
					Query.orderDesc(''),
					Query.equal('teamId', $.store_get($$store_subs ??= {}, '$organization', organization).$id)
				]
			}).then((r) => r.projects.map((p) => ({ value: p.$id, label: p.name }))).catch(() => []);
		});

		function takenIds(excludeIndex) {
			return new Set(projectAccess.filter((_, i) => i !== excludeIndex).map((a) => a.projectId).filter(Boolean));
		}

		async function loadProjects(index, search = '') {
			const gen = (rowGeneration[index] ?? 0) + 1;

			rowGeneration[index] = gen;
			rowSearching[index] = true;

			let allOptions;

			if (!search && prefetchPromise) {
				// Re-use the shared prefetch — avoids a redundant network request
				allOptions = await prefetchPromise;
			} else {
				const queries = [
					Query.limit(25),
					Query.orderDesc(''),
					Query.equal('teamId', $.store_get($$store_subs ??= {}, '$organization', organization).$id)
				];

				if (search) queries.push(Query.search('name', search));

				const result = await sdk.forConsole.organization($.store_get($$store_subs ??= {}, '$organization', organization).$id).listProjects({ queries }).catch(() => null);

				allOptions = (result?.projects ?? []).map((p) => ({ value: p.$id, label: p.name }));
			}

			// Discard stale responses — a newer request has already been dispatched
			if (rowGeneration[index] !== gen) return;

			const taken = takenIds(index);

			rowOptions[index] = allOptions.filter((p) => !taken.has(p.value));
			rowSearching[index] = false;
		}

		// When the component is initialised with pre-existing rows (edit mode),
		// options must be loaded eagerly so the ComboBox can resolve the project
		// name from the stored projectId instead of showing the raw UUID.
		// One debounced searcher per row — created on demand
		const debouncedSearchers = new Map();

		function getDebouncedSearch(index) {
			if (!debouncedSearchers.has(index)) {
				debouncedSearchers.set(index, debounce((search) => loadProjects(index, search), 300));
			}

			return debouncedSearchers.get(index);
		}

		function addRow() {
			const index = projectAccess.length;

			projectAccess = [...projectAccess, { projectId: '', roleName: 'developer' }];
			loadProjects(index);
		}

		function removeRow(i) {
			projectAccess = projectAccess.filter((_, idx) => idx !== i);
			rowOptions = rowOptions.filter((_, idx) => idx !== i);
			rowSearching = rowSearching.filter((_, idx) => idx !== i);
			rowGeneration = rowGeneration.filter((_, idx) => idx !== i);
			debouncedSearchers.delete(i);

			// The removed row's project is no longer taken — invalidate sibling caches
			// so they reload with the freed-up project available again.
			rowOptions = rowOptions.map(() => []);
		}

		// When a project is selected in one row, the other rows' cached option lists
		// are now stale (they still include the chosen project). Clear them so each
		// row reloads fresh options (filtered via takenIds) on next focus.
		function onProjectSelected(selectedIndex) {
			rowOptions = rowOptions.map((opts, i) => i === selectedIndex ? opts : []);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Layout.Stack) {
				$$renderer.push('<!--[-->');

				Layout.Stack($$renderer, {
					gap: 's',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(projectAccess);

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let access = each_array[i];

							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									direction: 'row',
									gap: 's',
									alignItems: 'flex-end',
									children: ($$renderer) => {
										$$renderer.push(`<div${$.attr_style('', { flex: '1' })}>`);

										if (Input.ComboBox) {
											$$renderer.push('<!--[-->');

											Input.ComboBox($$renderer, {
												id: `project-${$.stringify(i)}`,
												label: i === 0 ? 'Project' : '',
												required: true,
												placeholder: 'Search projects',
												options: rowOptions[i] ?? [],
												noResultsOption: rowSearching[i]
													? { disabled: true, message: 'Searching...' }
													: undefined,

												get value() {
													return access.projectId;
												},

												set value($$value) {
													access.projectId = $$value;
													$$settled = false;
												}
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(`</div> <div${$.attr_style('', { width: '140px' })}>`);

										InputSelect($$renderer, {
											id: `project-role-${$.stringify(i)}`,
											label: i === 0 ? 'Role' : '',
											required: true,
											options: projectRoles,
											get value() {
												return access.roleName;
											},

											set value($$value) {
												access.roleName = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div> <div${$.attr_style('', { 'padding-bottom': '2px' })}>`);

										Button($$renderer, {
											text: true,
											icon: true,
											size: 's',
											children: ($$renderer) => {
												Icon($$renderer, { size: 's', icon: IconTrash });
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(`<!--]--> <div>`);

						Button($$renderer, {
							secondary: true,
							size: 's',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Add project`);
							},

							$$slots: {
								default: true,
								start: ($$renderer) => {
									Icon($$renderer, { size: 's', icon: IconPlus, slot: 'start' });
								}
							}
						});

						$$renderer.push(`<!----></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { projectAccess });
	});
}