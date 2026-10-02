import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Loader,
	Globe,
	Store,
	Check,
	SquarePen,
	Cuboid,
	ExternalLink,
	Upload,
	X
} from 'lucide-svelte';

import SitePreview from '$lib/components/SitePreview.svelte';
import * as Tabs from '$lib/components/ui/tabs';
import { Input } from '$lib/components/ui/input/index.js';
import { Label } from '$lib/components/ui/label/index.js';
import { Site } from '$lib/common/models/Site';
import { Sites, SiteGroups, LibrarySymbols, SiteSnapshots } from '$lib/pocketbase/collections';
import { page as pageState } from '$app/state';
import Button from './ui/button/button.svelte';

import {
	create_site_symbol_entries,
	create_site_symbol_fields,
	create_site_symbols
} from '$lib/workers/CopySymbols.svelte';

import EmptyState from '$lib/components/EmptyState.svelte';
import { Skeleton } from '$lib/components/ui/skeleton/index.js';
import { marketplace, self } from '$lib/pocketbase/managers';
import { watch } from 'runed';
import BlockPickerPanel from '$lib/components/BlockPickerPanel.svelte';
import { Snapshot } from '$lib/common/models/Snapshot';

var root = $.from_html(`<div class="pointer-events-none absolute inset-0 bg-[#000000AA] flex items-center justify-center"><!></div>`);
var root_1 = $.from_html(`<div class="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">Free</div>`);
var root_2 = $.from_html(`<button class="group relative w-full aspect-[.69] rounded-lg border bg-background overflow-hidden text-left"><div class="relative h-full"><!> <!></div> <div class="absolute bottom-0 w-full p-3 z-20 bg-[#000] border-t"><div class="flex items-center gap-2"><div class="text-sm leading-none truncate"> </div> <!></div></div></button>`);
var root_3 = $.from_html(`<button type="button" class="absolute right-2 top-6 p-2 text-muted-foreground hover:text-foreground rounded-md" aria-label="Cancel"><!></button>`);
var root_4 = $.from_html(`<div class="rounded-lg border bg-[#111] p-4 shadow-sm w-full max-w-lg mx-auto"><form class="grid w-full items-center gap-1.5"><!> <!></form></div>`);
var root_5 = $.from_html(`<!> <span>Sites</span>`, 1);
var root_6 = $.from_html(`<!> <span>Marketplace</span>`, 1);
var root_7 = $.from_html(`<!> <!>`, 1);
var root_8 = $.from_html(`<li><button> </button></li>`);
var root_9 = $.from_html(`<div class="rounded-md border bg-muted/50 p-2 space-y-2"><div class="flex items-center gap-2"><!> <span class="text-xs truncate"> </span></div> <!></div>`);
var root_10 = $.from_html(`<!> <span>Reading...</span>`, 1);
var root_11 = $.from_html(`<!> <span>Import .primo</span>`, 1);
var root_12 = $.from_html(`<label><!> <input type="file" class="hidden" accept=".primo,.pala"/></label>`);
var root_13 = $.from_html(`<p class="text-xs text-destructive mt-2"> </p>`);
var root_14 = $.from_html(`<div class="text-sm text-muted-foreground p-6 text-center">No sites in this group.</div>`);
var root_15 = $.from_html(`<div class="p-3 pr-0 grid gap-4 place-content-start sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"></div>`);
var root_16 = $.from_html(`<div class="h-full md:border-r flex-1 flex flex-col"><div class="flex-1"><div class="p-2 text-xs text-muted-foreground">Groups</div> <ul class="p-2 pt-0 flex flex-col gap-1"></ul></div> <div class="border-t p-3"><!> <!></div></div> <div class="flex-4 overflow-auto"><!></div>`, 1);
var root_17 = $.from_html(`<div class="text-sm text-muted-foreground p-6 text-center">No starters in this group.</div>`);
var root_18 = $.from_html(`<div class="h-full md:border-r flex-1"><div class="p-2 text-xs text-muted-foreground">Groups</div> <ul class="p-2 pt-0 flex flex-col gap-1"></ul></div> <div class="flex-4 overflow-auto"><div class="p-3 pr-0 grid gap-4 col-span-3 place-content-start sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"><!></div></div>`, 1);
var root_19 = $.from_html(`<div class="px-3 py-2 text-xs text-right text-muted-foreground relative bg-[#111]"><a target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 hover:text-foreground hover:underline"><span>Open live preview</span> <!></a></div>`);
var root_20 = $.from_html(`<div class="flex-1 min-h-0"><!></div> <!>`, 1);
var root_21 = $.from_html(`<div class="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-8 text-center"><div class="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center"><!></div> <div><p class="font-medium"> </p> <p class="text-sm text-muted-foreground mt-1">Ready to create</p></div></div>`);
var root_22 = $.from_html(`<div class="flex-1 flex flex-col items-center justify-center gap-2 px-6 py-8 text-center"><p class="text-xs text-muted-foreground/80 max-w-[14rem]">Choose a starter site on the left to see a live preview here.</p></div>`);
var root_23 = $.from_html(`<div class="flex flex-col flex-6"><!> <!> <!></div> <div class="flex-3"><div class="h-[73vh] rounded-md bg-muted/20 flex flex-col overflow-hidden"><!></div></div>`, 1);
var root_24 = $.from_html(`<div class="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center"><div class="flex flex-col items-center gap-4"><!> <p class="text-lg font-medium"> </p></div></div>`);
var root_25 = $.from_html(`<div class="fixed bottom-4 right-4 z-50 max-w-md"><div class="bg-destructive text-destructive-foreground rounded-lg p-4 shadow-lg"><div class="flex items-start gap-3"><div class="flex-1"><p class="font-medium">Failed to create site</p> <p class="text-sm mt-1"> </p></div> <button class="text-destructive-foreground/80 hover:text-destructive-foreground"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></div></div></div>`);
var root_26 = $.from_html(`<div class="max-w-[1400px] h-screen px-2 flex flex-col mx-auto"><div class="pt-6 pb-6 h-[12vh] min-h-[7rem] relative"><h1 class="text-md leading-none tracking-tight text-center">Create Site</h1> <!> <div class="max-w-[900px] mx-auto mt-4 flex items-center gap-4 overflow-x-auto whitespace-nowrap w-full"><button class="flex items-center gap-3 focus:outline-none whitespace-nowrap"><div><!></div> <span>Enter Name</span></button> <div class="border-t border-border h-px flex-1"></div> <button><div><!></div> <span>Choose a Starter</span></button> <div class="border-t border-border h-px flex-1"></div> <button><div><!></div> <span>Add Blocks (optional)</span></button></div></div> <!> <!> <!> <div class="h-[10vh] bg-background pt-4 pb-4 flex items-center z-10"><div><!></div></div></div>  <!> <!>`, 1);

export default function CreateSite($$anchor, $$props) {
	$.push($$props, true);

	const /*
	  Create Site Wizard
	  - Steps: name → starter → blocks
	  - Flow: clone the selected starter via server-side endpoint, then optionally copy selected blocks.
	  - Data sources: local PocketBase (manager/self) and marketplace (marketplace).
	*/
	// Prefer group named "Default"; otherwise fall back to the first group.
	// Keep undefined until loaded so we can show skeletons
	// Starter groups sidebar state
	// When groups load/update, pick first available if none selected.
	// Marketplace (Starters) - site groups and sites
	// Eagerly compute and load derived data when this component mounts
	// Stepper action: advance through steps; create on final step.
	// Select a starter site by id and source.
	// Clear file selection when selecting a site
	// File upload state
	// Clear site selection
	// Stepper state
	// Optional blocks selection; keep resolved symbol pointers only.
	// Ensure that snapshots get loaded
	// Clone the selected starter via server-side endpoint
	// Ensure a default group exists. Capture the id locally — `site_group`
	// derives from the store and may not have re-synced right after the
	// commit, which would send an empty group_id and 400 the clone.
	// File upload - use FormData
	// Host is intentionally omitted — new sites are created
	// unassigned (see clone-site endpoint) and get a real domain
	// assigned separately in the dashboard.
	// Build request body for server-side clone
	// Host omitted — created unassigned (see clone-site endpoint).
	// Get snapshot URL for marketplace clone
	// Local clone
	// Call server-side clone endpoint
	// If no blocks to copy, finish immediately without waiting for
	// the reactive store to sync (avoids race condition on large templates).
	// Mark finalized so the reactive finalize effect below doesn't fire
	// oncreated a second time once the store syncs.
	// Track the created site ID from server response
	// Find the created site - first try by ID from server response, then fall back to name match
	// Finalize created site: copy optional blocks if any, then call oncreated.
	// Copy optional blocks if any were selected
	// No blocks to copy, just finish
	StarterButton = ($$anchor, site = $.noop, $$arg1) => {
		let source = $.derived_safe_equal(() => $.fallback($$arg1?.(), 'local'));
		var button = root_2();
		var div = $.child(button);
		var node = $.child(div);

		{
			let $0 = $.derived(() => $.get(source) === 'marketplace' ? `https://${site().host}` : undefined);

			SitePreview(node, {
				get site() {
					return site();
				},

				get src() {
					return $.get($0);
				}
			});
		}

		var node_1 = $.sibling(node, 2);

		{
			var consequent = ($$anchor) => {
				var div_1 = root();
				var node_2 = $.child(div_1);

				Check(node_2, { class: 'text-primary' });
				$.reset(div_1);
				$.append($$anchor, div_1);
			};

			$.if(node_1, ($$render) => {
				if ($.get(selected_starter_id) === site().id) $$render(consequent);
			});
		}

		$.reset(div);

		var div_2 = $.sibling(div, 2);
		var div_3 = $.child(div_2);
		var div_4 = $.child(div_3);
		var text = $.only_child(div_4, true);
		var node_3 = $.sibling(div_4, 2);

		{
			var consequent_1 = ($$anchor) => {
				var div_5 = root_1();

				$.append($$anchor, div_5);
			};

			$.if(node_3, ($$render) => {
				if ($.get(source) === 'marketplace') $$render(consequent_1);
			});
		}

		$.reset(div_3);
		$.reset(div_2);
		$.reset(button);
		$.template_effect(() => $.set_text(text, site().name));
		$.delegated('click', button, () => select_starter(site().id, $.get(source)));
		$.append($$anchor, button);
	};

	const all_site_groups = $.derived(() => SiteGroups.list({ sort: 'index' }) ?? []);
	const site_group = $.derived(() => $.get(all_site_groups)?.find((g) => g.name === 'Default') || $.get(all_site_groups)?.[0]);
	const starter_sites = $.derived(() => Sites.list({ sort: 'index' }) ?? undefined);
	let active_starters_group_id = $.state($.proxy($.get(all_site_groups)?.[0]?.id ?? ''));

	watch(() => ($.get(all_site_groups) ?? []).map((g) => g.id), (ids) => {
		if (!$.get(active_starters_group_id) && ids.length > 0) {
			$.set(active_starters_group_id, ids[0], true);
		}
	});

	const active_starters_group_sites = $.derived(() => $.get(starter_sites)
		? $.get(active_starters_group_id)
			? $.get(starter_sites).filter((s) => s.group === $.get(active_starters_group_id))
			: $.get(starter_sites)
		: undefined);

	// Marketplace (Starters) - site groups and sites
	const marketplace_site_groups = $.derived(() => SiteGroups.from(marketplace).list({ sort: 'index' }) ?? []);

	let active_marketplace_starters_group_id = $.state($.proxy($.get(marketplace_site_groups)?.find((g) => g.name === 'Featured')?.id ?? $.get(marketplace_site_groups)?.[0]?.id ?? ''));

	watch(() => ($.get(marketplace_site_groups) ?? []).map((g) => g.id), (ids) => {
		if (!$.get(active_marketplace_starters_group_id) && ids.length > 0) {
			const groups = $.get(marketplace_site_groups) ?? [];

			$.set(active_marketplace_starters_group_id, groups.find((g) => g.name === 'Featured')?.id ?? ids[0], true);
		}
	});

	const marketplace_starter_sites = $.derived(() => $.get(active_marketplace_starters_group_id)
		? Sites.from(marketplace).list({
			filter: { group: $.get(active_marketplace_starters_group_id) },
			sort: 'index'
		}) ?? undefined
		: Sites.from(marketplace).list({ sort: 'index' }) ?? undefined);

	let site_name = $.state(``);

	// Eagerly compute and load derived data when this component mounts
	$.user_effect(() => {
		void $.get(all_site_groups);
		void $.get(starter_sites);
		void $.get(active_starters_group_sites);
		void $.get(marketplace_site_groups);
		void $.get(marketplace_starter_sites);
	});

	// Stepper action: advance through steps; create on final step.
	function next_or_create() {
		if ($.get(step) === 'name') {
			if ($.get(can_go_starter)) $.set(step, 'starter');

			return;
		}

		if ($.get(step) === 'starter') {
			if ($.get(can_go_blocks)) $.set(step, 'blocks');

			return;
		}

		if ($.get(step) === 'blocks') {
			create_site();
		}
	}

	let starter_tab = $.state('sites');
	let selected_starter_id = $.state(``);
	let selected_starter_source = $.state('local');

	// Select a starter site by id and source.
	function select_starter(site_id, source = 'local') {
		$.set(selected_starter_id, site_id, true);
		$.set(selected_starter_source, source, true);

		// Clear file selection when selecting a site
		$.set(uploaded_snapshot_file, null);

		$.set(uploaded_snapshot, null);
	}

	// File upload state
	let uploaded_snapshot_file = $.state(null);

	let uploaded_snapshot = $.state(null);
	let file_upload_error = $.state(null);
	let parsing_file = $.state(false);

	async function handle_file_upload(event) {
		const input = event.target;
		const file = input.files?.[0];

		if (!file) return;

		$.set(file_upload_error, null);
		$.set(parsing_file, true);

		try {
			$.set(uploaded_snapshot, await Snapshot.decodeAsync(file), true);
			$.set(uploaded_snapshot_file, file, true);
			$.set(selected_starter_source, 'file');
			$.set(selected_starter_id, '' // Clear site selection
			);
		} catch(e) {
			console.error('Failed to parse snapshot file:', e);
			$.set(file_upload_error, e instanceof Error ? e.message : 'Invalid snapshot file', true);
			$.set(uploaded_snapshot_file, null);
			$.set(uploaded_snapshot, null);
		} finally {
			$.set(parsing_file, false);
		}
	}

	function clear_uploaded_file() {
		$.set(uploaded_snapshot_file, null);
		$.set(uploaded_snapshot, null);
		$.set(file_upload_error, null);
		$.set(selected_starter_source, 'local');
	}

	const selected_starter_site = $.derived(() => $.get(selected_starter_source) === 'local'
		? ($.get(starter_sites) ?? []).find((site) => site.id === $.get(selected_starter_id))
		: ($.get(marketplace_starter_sites) ?? []).find((site) => site.id === $.get(selected_starter_id)));

	// Stepper state
	const step_order = ['name', 'starter', 'blocks'];

	let step = $.state('name');
	const can_go_starter = $.derived(() => !!$.get(site_name));
	const can_go_blocks = $.derived(() => !!$.get(site_name) && (!!$.get(selected_starter_id) || !!$.get(uploaded_snapshot)));

	// Optional blocks selection; keep resolved symbol pointers only.
	let selected_block_ids = $.state($.proxy([]));

	const selected_blocks = $.derived(() => $.get(selected_block_ids).map(({ id, source }) => source === 'library'
		? LibrarySymbols.one(id)
		: LibrarySymbols.from(marketplace).one(id)).filter(Boolean) || []);

	const selected_block_fields = $.derived(() => $.get(selected_blocks).flatMap((symbol) => symbol?.fields()));
	const selected_block_entries = $.derived(() => $.get(selected_blocks).flatMap((symbol) => symbol?.entries()));

	async function copy_selected_blocks_to_site() {
		try {
			if (!$.get(selected_block_ids).length) return;

			const site = $.get(created_site);
			const source_symbols = $.get(selected_blocks).filter((symbol) => !!symbol);
			const source_symbol_fields = $.get(selected_block_fields).filter((field) => !!field);
			const source_symbol_entries = $.get(selected_block_entries).filter((entry) => !!entry);
			const site_symbol_map = create_site_symbols({ source_symbols, site });
			const site_symbol_field_map = create_site_symbol_fields({ source_symbol_fields, site_symbol_map });
			const site_symbol_entry_map = create_site_symbol_entries({ source_symbol_entries, site_symbol_field_map });
		} catch(error) {
			console.error('Error copying marketplace symbols:', error);

			throw error;
		}
	}

	const starter_snapshots = $.derived(() => SiteSnapshots.from(marketplace).list({ sort: '-created' }));

	$.user_effect(() => {
		// Ensure that snapshots get loaded
		$.get(starter_snapshots);
	});

	let completed = $.derived(() => Boolean($.get(site_name) && ($.get(selected_starter_id) || $.get(uploaded_snapshot))));
	let loading = $.state(false);
	let progress_message = $.state('');
	let error_message = $.state('');

	// Clone the selected starter via server-side endpoint
	async function create_site() {
		if (!$.get(selected_starter_id) && !$.get(uploaded_snapshot_file)) return;

		$.set(loading, true);
		$.set(error_message, '');
		$.set(progress_message, 'Creating site...');

		try {
			// Ensure a default group exists. Capture the id locally — `site_group`
			// derives from the store and may not have re-synced right after the
			// commit, which would send an empty group_id and 400 the clone.
			let group_id = $.get(site_group)?.id ?? '';

			if (!group_id) {
				const created_group = SiteGroups.create({ name: 'Default', index: 0 });

				await self.commit();
				group_id = created_group?.id ?? $.get(site_group)?.id ?? '';
			}

			if (!group_id) {
				throw new Error('Could not resolve a site group');
			}

			let response;

			if ($.get(selected_starter_source) === 'file' && $.get(uploaded_snapshot_file)) {
				// File upload - use FormData
				const form_data = new FormData();

				form_data.append('name', $.get(site_name));

				// Host is intentionally omitted — new sites are created
				// unassigned (see clone-site endpoint) and get a real domain
				// assigned separately in the dashboard.
				form_data.append('group_id', group_id);

				form_data.append('snapshot_file', $.get(uploaded_snapshot_file));

				response = await fetch(`${self.instance?.baseURL}/api/primo/clone-site`, {
					method: 'POST',
					headers: {
						Authorization: self.instance?.authStore.token ? `Bearer ${self.instance.authStore.token}` : ''
					},
					body: form_data
				});
			} else {
				// Build request body for server-side clone
				const request_body = {
					name: $.get(site_name),
					// Host omitted — created unassigned (see clone-site endpoint).
					group_id
				};

				if ($.get(selected_starter_source) === 'marketplace') {
					// Get snapshot URL for marketplace clone
					const snapshot_record = $.get(starter_snapshots)?.find((snapshot) => snapshot.site === $.get(selected_starter_id));

					if (!snapshot_record) {
						console.error('Snapshot not found. Selected starter:', $.get(selected_starter_id), 'Available snapshots:', $.get(starter_snapshots));

						throw new Error('Snapshot not found');
					}

					if (typeof snapshot_record.file !== 'string') {
						throw new Error('Invalid snapshot file. Please try a different starter.');
					}

					request_body.snapshot_url = `${marketplace.instance?.baseURL}/api/files/site_snapshots/${snapshot_record.id}/${snapshot_record.file}`;
				} else {
					// Local clone
					request_body.source_site_id = $.get(selected_starter_id);
				}

				// Call server-side clone endpoint
				response = await fetch(`${self.instance?.baseURL}/api/primo/clone-site`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: self.instance?.authStore.token ? `Bearer ${self.instance.authStore.token}` : ''
					},
					body: JSON.stringify(request_body)
				});
			}

			if (!response.ok) {
				const error_data = await response.json().catch(() => ({}));

				throw new Error(error_data.message || `Clone failed: ${response.statusText}`);
			}

			const result = await response.json();

			$.set(created_site_id, result.id, true);
			$.set(created_site_host, result.host, true);
			$.set(done_creating_site, true);

			// If no blocks to copy, finish immediately without waiting for
			// the reactive store to sync (avoids race condition on large templates).
			// Mark finalized so the reactive finalize effect below doesn't fire
			// oncreated a second time once the store syncs.
			if ($.get(selected_block_ids).length === 0) {
				finalized = true;
				$.set(loading, false);
				$$props.oncreated?.({ id: result.id, host: result.host });

				return;
			}
		} catch(e) {
			console.error('Site creation error:', e);
			$.set(loading, false);

			$.set(
				error_message,
				e instanceof Error
					? e.message
					: 'An error occurred while creating the site',
				true
			);
		}
	}

	// Track the created site ID from server response
	let created_site_id = $.state('');

	let created_site_host = $.state('');

	// Find the created site - first try by ID from server response, then fall back to name match
	const created_sites = $.derived(() => Sites.list({ filter: { host: pageState.url.host } }) ?? []);

	const created_site = $.derived(() => $.get(created_site_id)
		? Sites.one($.get(created_site_id)) ?? $.get(created_sites).find((s) => s.id === $.get(created_site_id))
		: $.get(created_sites).find((s) => s.name === $.get(site_name)));

	// Finalize created site: copy optional blocks if any, then call oncreated.
	let done_creating_site = $.state(false);

	let finalized = false;

	$.user_effect(() => {
		if (!finalized && $.get(done_creating_site) && $.get(created_site)) {
			finalized = true;

			const created_payload = {
				id: $.get(created_site_id),
				host: $.get(created_site_host) || $.get(created_site).host
			};

			// Copy optional blocks if any were selected
			if ($.get(selected_block_ids).length > 0) {
				copy_selected_blocks_to_site().then(() => self.commit()).then(() => $$props.oncreated?.(created_payload)).catch((e) => console.error(e)).finally(() => {
					$.set(loading, false);
				});
			} else {
				// No blocks to copy, just finish
				$.set(loading, false);

				$$props.oncreated?.(created_payload);
			}
		}
	});

	var fragment = root_26();
	var div_6 = $.first_child(fragment);
	var div_7 = $.child(div_6);
	var node_4 = $.sibling($.child(div_7), 2);

	{
		var consequent_2 = ($$anchor) => {
			var button_1 = root_3();
			var node_5 = $.child(button_1);

			X(node_5, { class: 'w-4 h-4' });
			$.reset(button_1);
			$.delegated('click', button_1, () => $$props.oncancel?.());
			$.append($$anchor, button_1);
		};

		$.if(node_4, ($$render) => {
			if ($$props.oncancel) $$render(consequent_2);
		});
	}

	var div_8 = $.sibling(node_4, 2);
	var button_2 = $.child(div_8);
	var div_9 = $.child(button_2);
	var node_6 = $.child(div_9);

	{
		var consequent_3 = ($$anchor) => {
			Check($$anchor, { class: 'w-4 h-4' });
		};

		var alternate = ($$anchor) => {
			SquarePen($$anchor, { class: 'w-4 h-4' });
		};

		$.if(node_6, ($$render) => {
			if ($.get(can_go_starter)) $$render(consequent_3); else $$render(alternate, -1);
		});
	}

	$.reset(div_9);

	var span = $.sibling(div_9, 2);

	$.reset(button_2);

	var button_3 = $.sibling(button_2, 4);
	var div_10 = $.child(button_3);
	var node_7 = $.child(div_10);

	{
		var consequent_4 = ($$anchor) => {
			Check($$anchor, { class: 'w-4 h-4' });
		};

		var alternate_1 = ($$anchor) => {
			Globe($$anchor, { class: 'w-4 h-4' });
		};

		$.if(node_7, ($$render) => {
			if ($.get(can_go_blocks)) $$render(consequent_4); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_10);

	var span_1 = $.sibling(div_10, 2);

	$.reset(button_3);

	var button_4 = $.sibling(button_3, 4);
	var div_11 = $.child(button_4);
	var node_8 = $.child(div_11);

	{
		var consequent_5 = ($$anchor) => {
			Check($$anchor, { class: 'w-4 h-4' });
		};

		var alternate_2 = ($$anchor) => {
			Cuboid($$anchor, { class: 'w-4 h-4' });
		};

		$.if(node_8, ($$render) => {
			if ($.get(selected_block_ids).length > 0) $$render(consequent_5); else $$render(alternate_2, -1);
		});
	}

	$.reset(div_11);

	var span_2 = $.sibling(div_11, 2);

	$.reset(button_4);
	$.reset(div_8);
	$.reset(div_7);

	var node_9 = $.sibling(div_7, 2);

	{
		var consequent_6 = ($$anchor) => {
			var div_12 = root_4();
			var form = $.child(div_12);
			var node_10 = $.child(form);

			Label(node_10, {
				for: 'site-name',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Site Name');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			Input(node_11, {
				type: 'text',
				id: 'site-name',
				get value() {
					return $.get(site_name);
				},

				oninput: (e) => {
					$.set(site_name, e.currentTarget.value.trim(), true);
				},
				autofocus: true
			});

			$.reset(form);
			$.reset(div_12);

			$.event('submit', form, (e) => {
				e.preventDefault();
				$.get(can_go_starter) ? $.set(step, 'starter') : null;
			});

			$.append($$anchor, div_12);
		};

		$.if(node_9, ($$render) => {
			if ($.get(step) === 'name') $$render(consequent_6);
		});
	}

	var node_12 = $.sibling(node_9, 2);

	{
		var consequent_19 = ($$anchor) => {
			var fragment_7 = $.comment();
			var node_13 = $.first_child(fragment_7);

			$.component(node_13, () => Tabs.Root, ($$anchor, Tabs_Root) => {
				Tabs_Root($$anchor, {
					class: 'h-[78vh] min-h-[30rem] w-full flex gap-4 flex-1 rounded-lg border bg-[#111] p-3 shadow-sm',
					get value() {
						return $.get(starter_tab);
					},

					set value($$value) {
						$.set(starter_tab, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_8 = root_23();
						var div_13 = $.first_child(fragment_8);
						var node_14 = $.child(div_13);

						$.component(node_14, () => Tabs.List, ($$anchor, Tabs_List) => {
							Tabs_List($$anchor, {
								class: 'rounded-9px bg-dark-10 shadow-mini-inset dark:bg-background grid w-full h-11 grid-cols-2 gap-1 p-1 text-sm font-semibold leading-[0.01em] dark:border dark:border-neutral-600/30',
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_7();
									var node_15 = $.first_child(fragment_9);

									$.component(node_15, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
										Tabs_Trigger($$anchor, {
											value: 'sites',
											class: 'data-[state=active]:shadow-mini dark:data-[state=active]:bg-muted h-8 rounded-[4px] bg-transparent py-2 data-[state=active]:bg-white flex gap-2',
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root_5();
												var node_16 = $.first_child(fragment_10);

												Globe(node_16, { class: 'h-4 w-4' });
												$.next(2);
												$.append($$anchor, fragment_10);
											},
											$$slots: { default: true }
										});
									});

									var node_17 = $.sibling(node_15, 2);

									$.component(node_17, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
										Tabs_Trigger_1($$anchor, {
											value: 'marketplace',
											class: 'data-[state=active]:shadow-mini dark:data-[state=active]:bg-muted h-8 rounded-[4px] bg-transparent py-2 data-[state=active]:bg-white flex gap-2',
											children: ($$anchor, $$slotProps) => {
												var fragment_11 = root_6();
												var node_18 = $.first_child(fragment_11);

												Store(node_18, { class: 'h-4 w-4' });
												$.next(2);
												$.append($$anchor, fragment_11);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});
						});

						var node_19 = $.sibling(node_14, 2);

						$.component(node_19, () => Tabs.Content, ($$anchor, Tabs_Content) => {
							Tabs_Content($$anchor, {
								value: 'sites',
								class: 'flex overflow-hidden h-full',
								children: ($$anchor, $$slotProps) => {
									var fragment_12 = $.comment();
									var node_20 = $.first_child(fragment_12);

									{
										var consequent_7 = ($$anchor) => {
											var fragment_13 = $.comment();
											var node_21 = $.first_child(fragment_13);

											$.each(node_21, 16, () => Array.from({ length: 6 }), $.index, ($$anchor, _) => {
												Skeleton($$anchor, { class: 'aspect-video w-full' });
											});

											$.append($$anchor, fragment_13);
										};

										var consequent_8 = ($$anchor) => {
											{
												let $0 = $.derived(() => ({
													label: 'Open Marketplace',
													icon: Store,
													onclick: () => $.set(starter_tab, 'marketplace')
												}));

												EmptyState($$anchor, {
													class: 'h-full col-span-4',
													get icon() {
														return Globe;
													},
													title: 'No sites to display',
													description: 'You don\'t have any sites here yet. When you create one, you\'ll be able to use it as a starting point for other sites. In the meantime, check the marketplace.',
													get button() {
														return $.get($0);
													}
												});
											}
										};

										var alternate_5 = ($$anchor) => {
											var fragment_16 = root_16();
											var div_14 = $.first_child(fragment_16);
											var div_15 = $.child(div_14);
											var ul = $.sibling($.child(div_15), 2);

											$.each(ul, 21, () => $.get(all_site_groups) ?? [], (group) => group.id, ($$anchor, group) => {
												var li = root_8();
												var button_5 = $.child(li);
												var text_2 = $.only_child(button_5, true);

												$.reset(li);

												$.template_effect(() => {
													$.set_class(button_5, 1, `w-full text-left px-2 py-1 rounded-md hover:bg-accent hover:text-accent-foreground ${$.get(active_starters_group_id) === $.get(group).id ? 'bg-accent text-accent-foreground' : ''}`);
													$.set_text(text_2, $.get(group).name);
												});

												$.delegated('click', button_5, () => $.set(active_starters_group_id, $.get(group).id, true));
												$.append($$anchor, li);
											});

											$.reset(ul);
											$.reset(div_15);

											var div_16 = $.sibling(div_15, 2);
											var node_22 = $.child(div_16);

											{
												var consequent_9 = ($$anchor) => {
													var div_17 = root_9();
													var div_18 = $.child(div_17);
													var node_23 = $.child(div_18);

													Check(node_23, { class: 'h-4 w-4 text-primary flex-shrink-0' });

													var span_3 = $.sibling(node_23, 2);
													var text_3 = $.only_child(span_3, true);

													$.reset(div_18);

													var node_24 = $.sibling(div_18, 2);

													Button(node_24, {
														variant: 'ghost',
														size: 'sm',
														class: 'w-full h-7 text-xs',
														onclick: clear_uploaded_file,
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('Remove');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});

													$.reset(div_17);
													$.template_effect(() => $.set_text(text_3, $.get(uploaded_snapshot_file).name));
													$.append($$anchor, div_17);
												};

												var alternate_4 = ($$anchor) => {
													var label = root_12();
													var node_25 = $.child(label);

													{
														var consequent_10 = ($$anchor) => {
															var fragment_17 = root_10();
															var node_26 = $.first_child(fragment_17);

															Loader(node_26, { class: 'h-4 w-4 animate-spin' });
															$.next(2);
															$.append($$anchor, fragment_17);
														};

														var alternate_3 = ($$anchor) => {
															var fragment_18 = root_11();
															var node_27 = $.first_child(fragment_18);

															Upload(node_27, { class: 'h-4 w-4' });
															$.next(2);
															$.append($$anchor, fragment_18);
														};

														$.if(node_25, ($$render) => {
															if ($.get(parsing_file)) $$render(consequent_10); else $$render(alternate_3, -1);
														});
													}

													var input_1 = $.sibling(node_25, 2);

													$.reset(label);

													$.template_effect(() => {
														$.set_class(label, 1, `flex items-center justify-center gap-2 w-full h-9 px-3 rounded-md border border-dashed cursor-pointer hover:bg-accent hover:border-accent-foreground/20 transition-colors text-sm text-muted-foreground hover:text-accent-foreground ${$.get(parsing_file) ? 'opacity-50 pointer-events-none' : ''}`);
														input_1.disabled = $.get(parsing_file);
													});

													$.delegated('change', input_1, handle_file_upload);
													$.append($$anchor, label);
												};

												$.if(node_22, ($$render) => {
													if ($.get(uploaded_snapshot_file)) $$render(consequent_9); else $$render(alternate_4, -1);
												});
											}

											var node_28 = $.sibling(node_22, 2);

											{
												var consequent_11 = ($$anchor) => {
													var p = root_13();
													var text_5 = $.only_child(p, true);

													$.template_effect(() => $.set_text(text_5, $.get(file_upload_error)));
													$.append($$anchor, p);
												};

												$.if(node_28, ($$render) => {
													if ($.get(file_upload_error)) $$render(consequent_11);
												});
											}

											$.reset(div_16);
											$.reset(div_14);

											var div_19 = $.sibling(div_14, 2);
											var node_29 = $.child(div_19);

											{
												var consequent_12 = ($$anchor) => {
													var div_20 = root_14();

													$.append($$anchor, div_20);
												};

												var consequent_13 = ($$anchor) => {
													var div_21 = root_15();

													$.each(div_21, 21, () => $.get(active_starters_group_sites), $.index, ($$anchor, site) => {
														StarterButton($$anchor, () => $.get(site));
													});

													$.reset(div_21);
													$.append($$anchor, div_21);
												};

												$.if(node_29, ($$render) => {
													if ($.get(active_starters_group_sites)?.length === 0) $$render(consequent_12); else if ($.get(active_starters_group_sites)) $$render(consequent_13, 1);
												});
											}

											$.reset(div_19);
											$.append($$anchor, fragment_16);
										};

										$.if(node_20, ($$render) => {
											if ($.get(active_starters_group_sites) === undefined) $$render(consequent_7); else if ($.get(starter_sites)?.length === 0) $$render(consequent_8, 1); else $$render(alternate_5, -1);
										});
									}

									$.append($$anchor, fragment_12);
								},
								$$slots: { default: true }
							});
						});

						var node_30 = $.sibling(node_19, 2);

						$.component(node_30, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
							Tabs_Content_1($$anchor, {
								value: 'marketplace',
								class: 'flex overflow-hidden h-full',
								children: ($$anchor, $$slotProps) => {
									var fragment_20 = root_18();
									var div_22 = $.first_child(fragment_20);
									var ul_1 = $.sibling($.child(div_22), 2);

									$.each(ul_1, 21, () => $.get(marketplace_site_groups) ?? [], (group) => group.id, ($$anchor, group) => {
										var li_1 = root_8();
										var button_6 = $.child(li_1);
										var text_6 = $.only_child(button_6, true);

										$.reset(li_1);

										$.template_effect(() => {
											$.set_class(button_6, 1, `w-full text-left px-2 py-1 rounded-md hover:bg-accent hover:text-accent-foreground ${$.get(active_marketplace_starters_group_id) === $.get(group).id ? 'bg-accent text-accent-foreground' : ''}`);
											$.set_text(text_6, $.get(group).name);
										});

										$.delegated('click', button_6, () => $.set(active_marketplace_starters_group_id, $.get(group).id, true));
										$.append($$anchor, li_1);
									});

									$.reset(ul_1);
									$.reset(div_22);

									var div_23 = $.sibling(div_22, 2);
									var div_24 = $.child(div_23);
									var node_31 = $.child(div_24);

									{
										var consequent_14 = ($$anchor) => {
											var fragment_21 = $.comment();
											var node_32 = $.first_child(fragment_21);

											$.each(node_32, 16, () => Array.from({ length: 6 }), $.index, ($$anchor, _) => {
												Skeleton($$anchor, { class: 'aspect-video w-full' });
											});

											$.append($$anchor, fragment_21);
										};

										var alternate_6 = ($$anchor) => {
											var fragment_23 = root_7();
											var node_33 = $.first_child(fragment_23);

											$.each(node_33, 17, () => $.get(marketplace_starter_sites), (site) => site.id, ($$anchor, site) => {
												StarterButton($$anchor, () => $.get(site), () => 'marketplace');
											});

											var node_34 = $.sibling(node_33, 2);

											{
												var consequent_15 = ($$anchor) => {
													var div_25 = root_17();

													$.append($$anchor, div_25);
												};

												$.if(node_34, ($$render) => {
													if (($.get(marketplace_starter_sites)?.length ?? 0) === 0) $$render(consequent_15);
												});
											}

											$.append($$anchor, fragment_23);
										};

										$.if(node_31, ($$render) => {
											if ($.get(marketplace_starter_sites) === undefined) $$render(consequent_14); else $$render(alternate_6, -1);
										});
									}

									$.reset(div_24);
									$.reset(div_23);
									$.append($$anchor, fragment_20);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_13);

						var div_26 = $.sibling(div_13, 2);
						var div_27 = $.child(div_26);
						var node_35 = $.child(div_27);

						{
							var consequent_17 = ($$anchor) => {
								const preview_url = $.derived(() => $.get(selected_starter_source) === 'marketplace'
									? `https://${$.get(selected_starter_site)?.host}`
									: `/?_site=${$.get(selected_starter_site)?.id}`);

								var fragment_25 = root_20();
								var div_28 = $.first_child(fragment_25);
								var node_36 = $.child(div_28);

								$.key(node_36, () => $.get(selected_starter_id), ($$anchor) => {
									{
										let $0 = $.derived(() => $.get(selected_starter_site) ? $.get(preview_url) : '');

										SitePreview($$anchor, {
											style: 'height: 100%; --thumbnail-height: 124%',
											get site() {
												return $.get(selected_starter_site);
											},

											get src() {
												return $.get($0);
											}
										});
									}
								});

								$.reset(div_28);

								var node_37 = $.sibling(div_28, 2);

								{
									var consequent_16 = ($$anchor) => {
										var div_29 = root_19();
										var a = $.child(div_29);
										var node_38 = $.sibling($.child(a), 2);

										ExternalLink(node_38, { class: 'h-3 w-3', 'aria-hidden': 'true' });
										$.reset(a);
										$.reset(div_29);
										$.template_effect(() => $.set_attribute(a, 'href', $.get(preview_url)));
										$.append($$anchor, div_29);
									};

									$.if(node_37, ($$render) => {
										if ($.get(preview_url)) $$render(consequent_16);
									});
								}

								$.append($$anchor, fragment_25);
							};

							var consequent_18 = ($$anchor) => {
								var div_30 = root_21();
								var div_31 = $.child(div_30);
								var node_39 = $.child(div_31);

								Check(node_39, { class: 'h-8 w-8 text-primary' });
								$.reset(div_31);

								var div_32 = $.sibling(div_31, 2);
								var p_1 = $.child(div_32);
								var text_7 = $.only_child(p_1, true);

								$.next(2);
								$.reset(div_32);
								$.reset(div_30);
								$.template_effect(() => $.set_text(text_7, $.get(uploaded_snapshot).records.sites[0]?.name ?? 'Imported Site'));
								$.append($$anchor, div_30);
							};

							var alternate_7 = ($$anchor) => {
								var div_33 = root_22();

								$.append($$anchor, div_33);
							};

							$.if(node_35, ($$render) => {
								if ($.get(selected_starter_site)) $$render(consequent_17); else if ($.get(uploaded_snapshot)) $$render(consequent_18, 1); else $$render(alternate_7, -1);
							});
						}

						$.reset(div_27);
						$.reset(div_26);
						$.append($$anchor, fragment_8);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_7);
		};

		$.if(node_12, ($$render) => {
			if ($.get(step) === 'starter') $$render(consequent_19);
		});
	}

	var node_40 = $.sibling(node_12, 2);

	{
		var consequent_20 = ($$anchor) => {
			BlockPickerPanel($$anchor, {
				get selected() {
					return $.get(selected_block_ids);
				},

				set selected($$value) {
					$.set(selected_block_ids, $$value, true);
				}
			});
		};

		$.if(node_40, ($$render) => {
			if ($.get(step) === 'blocks') $$render(consequent_20);
		});
	}

	var div_34 = $.sibling(node_40, 2);
	var div_35 = $.child(div_34);
	var node_41 = $.child(div_35);

	{
		let $0 = $.derived(() => $.get(loading) || $.get(step) === 'name' && !$.get(can_go_starter) || $.get(step) === 'starter' && !$.get(can_go_blocks) || $.get(step) === 'blocks' && !$.get(completed));

		Button(node_41, {
			onclick: next_or_create,
			get disabled() {
				return $.get($0);
			},
			class: 'inline-flex justify-center items-center relative gap-2',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_8 = $.text();

				$.template_effect(() => $.set_text(text_8, $.get(step) === 'blocks' ? 'Done' : 'Next'));
				$.append($$anchor, text_8);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_35);
	$.reset(div_34);
	$.reset(div_6);

	var node_42 = $.sibling(div_6, 2);

	{
		var consequent_21 = ($$anchor) => {
			var div_36 = root_24();
			var div_37 = $.child(div_36);
			var node_43 = $.child(div_37);

			Loader(node_43, { class: 'h-12 w-12 animate-spin text-primary' });

			var p_2 = $.sibling(node_43, 2);
			var text_9 = $.only_child(p_2, true);

			$.reset(div_37);
			$.reset(div_36);
			$.template_effect(() => $.set_text(text_9, $.get(progress_message)));
			$.append($$anchor, div_36);
		};

		$.if(node_42, ($$render) => {
			if ($.get(loading)) $$render(consequent_21);
		});
	}

	var node_44 = $.sibling(node_42, 2);

	{
		var consequent_22 = ($$anchor) => {
			var div_38 = root_25();
			var div_39 = $.child(div_38);
			var div_40 = $.child(div_39);
			var div_41 = $.child(div_40);
			var p_3 = $.sibling($.child(div_41), 2);
			var text_10 = $.only_child(p_3, true);

			$.reset(div_41);

			var button_7 = $.sibling(div_41, 2);

			$.reset(div_40);
			$.reset(div_39);
			$.reset(div_38);
			$.template_effect(() => $.set_text(text_10, $.get(error_message)));
			$.delegated('click', button_7, () => $.set(error_message, ''));
			$.append($$anchor, div_38);
		};

		$.if(node_44, ($$render) => {
			if ($.get(error_message)) $$render(consequent_22);
		});
	}

	$.template_effect(
		($0, $1, $2) => {
			$.set_class(div_9, 1, `w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${$0 ?? ''}`);

			$.set_class(span, 1, `text-sm ${$.get(step) === 'name'
				? 'text-foreground font-medium'
				: 'text-muted-foreground'}`);

			$.set_class(button_3, 1, `flex items-center gap-3 focus:outline-none whitespace-nowrap ${$.get(can_go_starter) ? '' : 'opacity-50 pointer-events-none'}`);
			button_3.disabled = !$.get(can_go_starter);
			$.set_class(div_10, 1, `w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${$1 ?? ''}`);

			$.set_class(span_1, 1, `text-sm ${$.get(step) === 'starter'
				? 'text-foreground font-medium'
				: 'text-muted-foreground'}`);

			$.set_class(button_4, 1, `flex items-center gap-3 focus:outline-none whitespace-nowrap ${$.get(can_go_blocks) ? '' : 'opacity-50 pointer-events-none'}`);
			button_4.disabled = !$.get(can_go_blocks);
			$.set_class(div_11, 1, `w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${$2 ?? ''}`);

			$.set_class(span_2, 1, `text-sm ${$.get(step) === 'blocks'
				? 'text-foreground font-medium'
				: 'text-muted-foreground'}`);

			$.set_class(div_35, 1, $.clsx($.get(step) === 'name'
				? 'w-full max-w-lg mx-auto flex justify-end gap-3'
				: 'w-full max-w-[1400px] mx-auto flex justify-end gap-3'));
		},
		[
			() => step_order.indexOf($.get(step)) >= step_order.indexOf('name')
				? 'bg-primary text-primary-foreground'
				: 'bg-muted text-foreground',

			() => step_order.indexOf($.get(step)) >= step_order.indexOf('starter')
				? 'bg-primary text-primary-foreground'
				: 'bg-muted text-foreground',

			() => step_order.indexOf($.get(step)) >= step_order.indexOf('blocks')
				? 'bg-primary text-primary-foreground'
				: 'bg-muted text-foreground'
		]
	);

	$.delegated('click', button_2, () => $.set(step, 'name'));
	$.delegated('click', button_3, () => $.set(step, 'starter'));
	$.delegated('click', button_4, () => $.set(step, 'blocks'));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'change']);