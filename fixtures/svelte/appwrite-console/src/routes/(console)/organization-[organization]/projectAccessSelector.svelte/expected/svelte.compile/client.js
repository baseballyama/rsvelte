import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div><!></div> <div><!></div> <div><!></div>`, 1);
var root_1 = $.from_html(`<!> <div><!></div>`, 1);

export default function ProjectAccessSelector($$anchor, $$props) {
	$.push($$props, true);

	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let projectAccess = $.prop($$props, 'projectAccess', 31, () => $.proxy([]));

	// Per-row options, loading state, and request-generation counters
	let rowOptions = $.state($.proxy([]));

	let rowSearching = $.state($.proxy([]));

	// Incremented on every loadProjects call for a row; the response is
	// discarded if a newer request has already been dispatched.
	let rowGeneration = $.state($.proxy([]));

	// Prefetch the first page the moment this component mounts (i.e. when the
	// user switches to "Specific projects") so results are ready or in-flight
	// before any row is opened.  All rows share this single Promise for
	// unfiltered loads; typed searches always hit the API separately.
	let prefetchPromise = null;

	onMount(() => {
		prefetchPromise = sdk.forConsole.organization($organization().$id).listProjects({
			queries: [
				Query.limit(25),
				Query.orderDesc(''),
				Query.equal('teamId', $organization().$id)
			]
		}).then((r) => r.projects.map((p) => ({ value: p.$id, label: p.name }))).catch(() => []);
	});

	function takenIds(excludeIndex) {
		return new Set(projectAccess().filter((_, i) => i !== excludeIndex).map((a) => a.projectId).filter(Boolean));
	}

	async function loadProjects(index, search = '') {
		const gen = ($.get(rowGeneration)[index] ?? 0) + 1;

		$.get(rowGeneration)[index] = gen;
		$.get(rowSearching)[index] = true;

		let allOptions;

		if (!search && prefetchPromise) {
			// Re-use the shared prefetch — avoids a redundant network request
			allOptions = await prefetchPromise;
		} else {
			const queries = [
				Query.limit(25),
				Query.orderDesc(''),
				Query.equal('teamId', $organization().$id)
			];

			if (search) queries.push(Query.search('name', search));

			const result = await sdk.forConsole.organization($organization().$id).listProjects({ queries }).catch(() => null);

			allOptions = (result?.projects ?? []).map((p) => ({ value: p.$id, label: p.name }));
		}

		// Discard stale responses — a newer request has already been dispatched
		if ($.get(rowGeneration)[index] !== gen) return;

		const taken = takenIds(index);

		$.get(rowOptions)[index] = allOptions.filter((p) => !taken.has(p.value));
		$.get(rowSearching)[index] = false;
	}

	// When the component is initialised with pre-existing rows (edit mode),
	// options must be loaded eagerly so the ComboBox can resolve the project
	// name from the stored projectId instead of showing the raw UUID.
	$.user_effect(() => {
		projectAccess().forEach((access, i) => {
			if (access.projectId && !$.get(rowOptions)[i]?.length && !$.get(rowSearching)[i]) {
				loadProjects(i);
			}
		});
	});

	// One debounced searcher per row — created on demand
	const debouncedSearchers = new Map();

	function getDebouncedSearch(index) {
		if (!debouncedSearchers.has(index)) {
			debouncedSearchers.set(index, debounce((search) => loadProjects(index, search), 300));
		}

		return debouncedSearchers.get(index);
	}

	function addRow() {
		const index = projectAccess().length;

		projectAccess([...projectAccess(), { projectId: '', roleName: 'developer' }]);
		loadProjects(index);
	}

	function removeRow(i) {
		projectAccess(projectAccess().filter((_, idx) => idx !== i));
		$.set(rowOptions, $.get(rowOptions).filter((_, idx) => idx !== i), true);
		$.set(rowSearching, $.get(rowSearching).filter((_, idx) => idx !== i), true);
		$.set(rowGeneration, $.get(rowGeneration).filter((_, idx) => idx !== i), true);
		debouncedSearchers.delete(i);

		// The removed row's project is no longer taken — invalidate sibling caches
		// so they reload with the freed-up project available again.
		$.set(rowOptions, $.get(rowOptions).map(() => []), true);
	}

	// When a project is selected in one row, the other rows' cached option lists
	// are now stale (they still include the chosen project). Clear them so each
	// row reloads fresh options (filtered via takenIds) on next focus.
	function onProjectSelected(selectedIndex) {
		$.set(rowOptions, $.get(rowOptions).map((opts, i) => i === selectedIndex ? opts : []), true);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			gap: 's',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.each(node_1, 17, projectAccess, $.index, ($$anchor, access, i) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
						Layout_Stack_1($$anchor, {
							direction: 'row',
							gap: 's',
							alignItems: 'flex-end',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var div = $.first_child(fragment_3);

								$.set_style(div, '', {}, { flex: '1' });

								var node_3 = $.child(div);

								{
									let $0 = $.derived(() => $.get(rowOptions)[i] ?? []);

									let $1 = $.derived(() => $.get(rowSearching)[i]
										? { disabled: true, message: 'Searching...' }
										: undefined);

									$.component(node_3, () => Input.ComboBox, ($$anchor, Input_ComboBox) => {
										Input_ComboBox($$anchor, {
											id: `project-${i}`,
											label: i === 0 ? 'Project' : '',
											required: true,
											placeholder: 'Search projects',
											get options() {
												return $.get($0);
											},

											get noResultsOption() {
												return $.get($1);
											},

											get value() {
												return $.get(access).projectId;
											},

											set value($$value) {
												($.get(access).projectId = $$value);
											},
											$$events: { change: () => onProjectSelected(i) }
										});
									});
								}

								$.reset(div);

								var div_1 = $.sibling(div, 2);

								$.set_style(div_1, '', {}, { width: '140px' });

								var node_4 = $.child(div_1);

								InputSelect(node_4, {
									id: `project-role-${i}`,
									label: i === 0 ? 'Role' : '',
									required: true,
									get options() {
										return projectRoles;
									},

									get value() {
										return $.get(access).roleName;
									},

									set value($$value) {
										($.get(access).roleName = $$value);
									}
								});

								$.reset(div_1);

								var div_2 = $.sibling(div_1, 2);

								$.set_style(div_2, '', {}, { 'padding-bottom': '2px' });

								var node_5 = $.child(div_2);

								Button(node_5, {
									text: true,
									icon: true,
									size: 's',
									$$events: { click: () => removeRow(i) },
									children: ($$anchor, $$slotProps) => {
										Icon($$anchor, {
											size: 's',
											get icon() {
												return IconTrash;
											}
										});
									},
									$$slots: { default: true }
								});

								$.reset(div_2);

								$.delegated('focusin', div, () => {
									if (!$.get(rowOptions)[i]?.length) loadProjects(i);
								});

								$.delegated('input', div, (e) => {
									if (e.target instanceof HTMLInputElement) {
										getDebouncedSearch(i)(e.target.value);
									}
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				});

				var div_3 = $.sibling(node_1, 2);
				var node_6 = $.child(div_3);

				Button(node_6, {
					secondary: true,
					size: 's',
					$$events: { click: addRow },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Add project');

						$.append($$anchor, text);
					},

					$$slots: {
						default: true,
						start: ($$anchor, $$slotProps) => {
							Icon($$anchor, {
								size: 's',
								get icon() {
									return IconPlus;
								},
								slot: 'start'
							});
						}
					}
				});

				$.reset(div_3);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['focusin', 'input']);