import * as $ from 'svelte/internal/server';

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

export default function CreateSite($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/*
		  Create Site Wizard
		  - Steps: name → starter → blocks
		  - Flow: clone the selected starter via server-side endpoint, then optionally copy selected blocks.
		  - Data sources: local PocketBase (manager/self) and marketplace (marketplace).
		*/
		const { oncreated, oncancel } = $$props;

		const all_site_groups = $.derived(() => SiteGroups.list({ sort: 'index' }) ?? []);

		// Prefer group named "Default"; otherwise fall back to the first group.
		const site_group = $.derived(() => all_site_groups()?.find((g) => g.name === 'Default') || all_site_groups()?.[0]);

		// Keep undefined until loaded so we can show skeletons
		const starter_sites = $.derived(() => Sites.list({ sort: 'index' }) ?? undefined);

		// Starter groups sidebar state
		let active_starters_group_id = all_site_groups()?.[0]?.id ?? '';

		// When groups load/update, pick first available if none selected.
		watch(() => (all_site_groups() ?? []).map((g) => g.id), (ids) => {
			if (!active_starters_group_id && ids.length > 0) {
				active_starters_group_id = ids[0];
			}
		});

		const active_starters_group_sites = $.derived(() => starter_sites()
			? active_starters_group_id
				? starter_sites().filter((s) => s.group === active_starters_group_id)
				: starter_sites()
			: undefined);

		// Marketplace (Starters) - site groups and sites
		const marketplace_site_groups = $.derived(() => SiteGroups.from(marketplace).list({ sort: 'index' }) ?? []);

		let active_marketplace_starters_group_id = marketplace_site_groups()?.find((g) => g.name === 'Featured')?.id ?? marketplace_site_groups()?.[0]?.id ?? '';

		watch(() => (marketplace_site_groups() ?? []).map((g) => g.id), (ids) => {
			if (!active_marketplace_starters_group_id && ids.length > 0) {
				const groups = marketplace_site_groups() ?? [];

				active_marketplace_starters_group_id = groups.find((g) => g.name === 'Featured')?.id ?? ids[0];
			}
		});

		const marketplace_starter_sites = $.derived(() => active_marketplace_starters_group_id
			? Sites.from(marketplace).list({
				filter: { group: active_marketplace_starters_group_id },
				sort: 'index'
			}) ?? undefined
			: Sites.from(marketplace).list({ sort: 'index' }) ?? undefined);

		let site_name = ``;

		// Eagerly compute and load derived data when this component mounts
		// Stepper action: advance through steps; create on final step.
		function next_or_create() {
			if (step === 'name') {
				if (can_go_starter()) step = 'starter';

				return;
			}

			if (step === 'starter') {
				if (can_go_blocks()) step = 'blocks';

				return;
			}

			if (step === 'blocks') {
				create_site();
			}
		}

		let starter_tab = 'sites';
		let selected_starter_id = ``;
		let selected_starter_source = 'local';

		// Select a starter site by id and source.
		function select_starter(site_id, source = 'local') {
			selected_starter_id = site_id;
			selected_starter_source = source;

			// Clear file selection when selecting a site
			uploaded_snapshot_file = null;

			uploaded_snapshot = null;
		}

		// File upload state
		let uploaded_snapshot_file = null;

		let uploaded_snapshot = null;
		let file_upload_error = null;
		let parsing_file = false;

		async function handle_file_upload(event) {
			const input = event.target;
			const file = input.files?.[0];

			if (!file) return;

			file_upload_error = null;
			parsing_file = true;

			try {
				uploaded_snapshot = await Snapshot.decodeAsync(file);
				uploaded_snapshot_file = file;
				selected_starter_source = 'file';
				selected_starter_id = ''; // Clear site selection
			} catch(e) {
				console.error('Failed to parse snapshot file:', e);
				file_upload_error = e instanceof Error ? e.message : 'Invalid snapshot file';
				uploaded_snapshot_file = null;
				uploaded_snapshot = null;
			} finally {
				parsing_file = false;
			}
		}

		function clear_uploaded_file() {
			uploaded_snapshot_file = null;
			uploaded_snapshot = null;
			file_upload_error = null;
			selected_starter_source = 'local';
		}

		const selected_starter_site = $.derived(() => selected_starter_source === 'local'
			? (starter_sites() ?? []).find((site) => site.id === selected_starter_id)
			: (marketplace_starter_sites() ?? []).find((site) => site.id === selected_starter_id));

		// Stepper state
		const step_order = ['name', 'starter', 'blocks'];

		let step = 'name';
		const can_go_starter = $.derived(() => !!site_name);
		const can_go_blocks = $.derived(() => !!site_name && (!!selected_starter_id || !!uploaded_snapshot));

		// Optional blocks selection; keep resolved symbol pointers only.
		let selected_block_ids = [];

		const selected_blocks = $.derived(() => selected_block_ids.map(({ id, source }) => source === 'library'
			? LibrarySymbols.one(id)
			: LibrarySymbols.from(marketplace).one(id)).filter(Boolean) || []);

		const selected_block_fields = $.derived(() => selected_blocks().flatMap((symbol) => symbol?.fields()));
		const selected_block_entries = $.derived(() => selected_blocks().flatMap((symbol) => symbol?.entries()));

		async function copy_selected_blocks_to_site() {
			try {
				if (!selected_block_ids.length) return;

				const site = created_site();
				const source_symbols = selected_blocks().filter((symbol) => !!symbol);
				const source_symbol_fields = selected_block_fields().filter((field) => !!field);
				const source_symbol_entries = selected_block_entries().filter((entry) => !!entry);
				const site_symbol_map = create_site_symbols({ source_symbols, site });
				const site_symbol_field_map = create_site_symbol_fields({ source_symbol_fields, site_symbol_map });
				const site_symbol_entry_map = create_site_symbol_entries({ source_symbol_entries, site_symbol_field_map });
			} catch(error) {
				console.error('Error copying marketplace symbols:', error);

				throw error;
			}
		}

		const starter_snapshots = $.derived(() => SiteSnapshots.from(marketplace).list({ sort: '-created' }));

		// Ensure that snapshots get loaded
		let completed = $.derived(() => Boolean(site_name && (selected_starter_id || uploaded_snapshot)));

		let loading = false;
		let progress_message = '';
		let error_message = '';

		// Clone the selected starter via server-side endpoint
		async function create_site() {
			if (!selected_starter_id && !uploaded_snapshot_file) return;

			loading = true;
			error_message = '';
			progress_message = 'Creating site...';

			try {
				// Ensure a default group exists. Capture the id locally — `site_group`
				// derives from the store and may not have re-synced right after the
				// commit, which would send an empty group_id and 400 the clone.
				let group_id = site_group()?.id ?? '';

				if (!group_id) {
					const created_group = SiteGroups.create({ name: 'Default', index: 0 });

					await self.commit();
					group_id = created_group?.id ?? site_group()?.id ?? '';
				}

				if (!group_id) {
					throw new Error('Could not resolve a site group');
				}

				let response;

				if (selected_starter_source === 'file' && uploaded_snapshot_file) {
					// File upload - use FormData
					const form_data = new FormData();

					form_data.append('name', site_name);

					// Host is intentionally omitted — new sites are created
					// unassigned (see clone-site endpoint) and get a real domain
					// assigned separately in the dashboard.
					form_data.append('group_id', group_id);

					form_data.append('snapshot_file', uploaded_snapshot_file);

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
						name: site_name,
						// Host omitted — created unassigned (see clone-site endpoint).
						group_id
					};

					if (selected_starter_source === 'marketplace') {
						// Get snapshot URL for marketplace clone
						const snapshot_record = starter_snapshots()?.find((snapshot) => snapshot.site === selected_starter_id);

						if (!snapshot_record) {
							console.error('Snapshot not found. Selected starter:', selected_starter_id, 'Available snapshots:', starter_snapshots());

							throw new Error('Snapshot not found');
						}

						if (typeof snapshot_record.file !== 'string') {
							throw new Error('Invalid snapshot file. Please try a different starter.');
						}

						request_body.snapshot_url = `${marketplace.instance?.baseURL}/api/files/site_snapshots/${snapshot_record.id}/${snapshot_record.file}`;
					} else {
						// Local clone
						request_body.source_site_id = selected_starter_id;
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

				created_site_id = result.id;
				created_site_host = result.host;
				done_creating_site = true;

				// If no blocks to copy, finish immediately without waiting for
				// the reactive store to sync (avoids race condition on large templates).
				// Mark finalized so the reactive finalize effect below doesn't fire
				// oncreated a second time once the store syncs.
				if (selected_block_ids.length === 0) {
					finalized = true;
					loading = false;
					oncreated?.({ id: result.id, host: result.host });

					return;
				}
			} catch(e) {
				console.error('Site creation error:', e);
				loading = false;

				error_message = e instanceof Error
					? e.message
					: 'An error occurred while creating the site';
			}
		}

		// Track the created site ID from server response
		let created_site_id = '';

		let created_site_host = '';

		// Find the created site - first try by ID from server response, then fall back to name match
		const created_sites = $.derived(() => Sites.list({ filter: { host: pageState.url.host } }) ?? []);

		const created_site = $.derived(() => created_site_id
			? Sites.one(created_site_id) ?? created_sites().find((s) => s.id === created_site_id)
			: created_sites().find((s) => s.name === site_name));

		// Finalize created site: copy optional blocks if any, then call oncreated.
		let done_creating_site = false;

		let finalized = false;

		function // Copy optional blocks if any were selected
		// No blocks to copy, just finish
		StarterButton($$renderer, site, source = 'local') {
			$$renderer.push(`<button class="group relative w-full aspect-[.69] rounded-lg border bg-background overflow-hidden text-left"><div class="relative h-full">`);

			SitePreview($$renderer, {
				site,
				src: source === 'marketplace' ? `https://${site.host}` : undefined
			});

			$$renderer.push(`<!----> `);

			if (selected_starter_id === site.id) {
				$$renderer.push(`<!--[0--><div class="pointer-events-none absolute inset-0 bg-[#000000AA] flex items-center justify-center">`);
				Check($$renderer, { class: 'text-primary' });
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="absolute bottom-0 w-full p-3 z-20 bg-[#000] border-t"><div class="flex items-center gap-2"><div class="text-sm leading-none truncate">${$.escape(site.name)}</div> `);

			if (source === 'marketplace') {
				$$renderer.push(`<!--[0--><div class="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">Free</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div></button>`);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="max-w-[1400px] h-screen px-2 flex flex-col mx-auto"><div class="pt-6 pb-6 h-[12vh] min-h-[7rem] relative"><h1 class="text-md leading-none tracking-tight text-center">Create Site</h1> `);

			if (oncancel) {
				$$renderer.push(`<!--[0--><button type="button" class="absolute right-2 top-6 p-2 text-muted-foreground hover:text-foreground rounded-md" aria-label="Cancel">`);
				X($$renderer, { class: 'w-4 h-4' });
				$$renderer.push(`<!----></button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="max-w-[900px] mx-auto mt-4 flex items-center gap-4 overflow-x-auto whitespace-nowrap w-full"><button class="flex items-center gap-3 focus:outline-none whitespace-nowrap"><div${$.attr_class(`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step_order.indexOf(step) >= step_order.indexOf('name')
				? 'bg-primary text-primary-foreground'
				: 'bg-muted text-foreground'}`)}>`);

			if (can_go_starter()) {
				$$renderer.push('<!--[0-->');
				Check($$renderer, { class: 'w-4 h-4' });
			} else {
				$$renderer.push('<!--[-1-->');
				SquarePen($$renderer, { class: 'w-4 h-4' });
			}

			$$renderer.push(`<!--]--></div> <span${$.attr_class(`text-sm ${step === 'name'
				? 'text-foreground font-medium'
				: 'text-muted-foreground'}`)}>Enter Name</span></button> <div class="border-t border-border h-px flex-1"></div> <button${$.attr_class(`flex items-center gap-3 focus:outline-none whitespace-nowrap ${can_go_starter() ? '' : 'opacity-50 pointer-events-none'}`)}${$.attr('disabled', !can_go_starter(), true)}><div${$.attr_class(`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step_order.indexOf(step) >= step_order.indexOf('starter')
				? 'bg-primary text-primary-foreground'
				: 'bg-muted text-foreground'}`)}>`);

			if (can_go_blocks()) {
				$$renderer.push('<!--[0-->');
				Check($$renderer, { class: 'w-4 h-4' });
			} else {
				$$renderer.push('<!--[-1-->');
				Globe($$renderer, { class: 'w-4 h-4' });
			}

			$$renderer.push(`<!--]--></div> <span${$.attr_class(`text-sm ${step === 'starter'
				? 'text-foreground font-medium'
				: 'text-muted-foreground'}`)}>Choose a Starter</span></button> <div class="border-t border-border h-px flex-1"></div> <button${$.attr_class(`flex items-center gap-3 focus:outline-none whitespace-nowrap ${can_go_blocks() ? '' : 'opacity-50 pointer-events-none'}`)}${$.attr('disabled', !can_go_blocks(), true)}><div${$.attr_class(`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step_order.indexOf(step) >= step_order.indexOf('blocks')
				? 'bg-primary text-primary-foreground'
				: 'bg-muted text-foreground'}`)}>`);

			if (selected_block_ids.length > 0) {
				$$renderer.push('<!--[0-->');
				Check($$renderer, { class: 'w-4 h-4' });
			} else {
				$$renderer.push('<!--[-1-->');
				Cuboid($$renderer, { class: 'w-4 h-4' });
			}

			$$renderer.push(`<!--]--></div> <span${$.attr_class(`text-sm ${step === 'blocks'
				? 'text-foreground font-medium'
				: 'text-muted-foreground'}`)}>Add Blocks (optional)</span></button></div></div> `);

			if (step === 'name') {
				$$renderer.push(`<!--[0--><div class="rounded-lg border bg-[#111] p-4 shadow-sm w-full max-w-lg mx-auto"><form class="grid w-full items-center gap-1.5">`);

				Label($$renderer, {
					for: 'site-name',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Site Name`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Input($$renderer, {
					type: 'text',
					id: 'site-name',
					value: site_name,
					oninput: (e) => {
						site_name = e.currentTarget.value.trim();
					},
					autofocus: true
				});

				$$renderer.push(`<!----></form></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (step === 'starter') {
				$$renderer.push('<!--[0-->');

				if (Tabs.Root) {
					$$renderer.push('<!--[-->');

					Tabs.Root($$renderer, {
						class: 'h-[78vh] min-h-[30rem] w-full flex gap-4 flex-1 rounded-lg border bg-[#111] p-3 shadow-sm',
						get value() {
							return starter_tab;
						},

						set value($$value) {
							starter_tab = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							$$renderer.push(`<div class="flex flex-col flex-6">`);

							if (Tabs.List) {
								$$renderer.push('<!--[-->');

								Tabs.List($$renderer, {
									class: 'rounded-9px bg-dark-10 shadow-mini-inset dark:bg-background grid w-full h-11 grid-cols-2 gap-1 p-1 text-sm font-semibold leading-[0.01em] dark:border dark:border-neutral-600/30',
									children: ($$renderer) => {
										if (Tabs.Trigger) {
											$$renderer.push('<!--[-->');

											Tabs.Trigger($$renderer, {
												value: 'sites',
												class: 'data-[state=active]:shadow-mini dark:data-[state=active]:bg-muted h-8 rounded-[4px] bg-transparent py-2 data-[state=active]:bg-white flex gap-2',
												children: ($$renderer) => {
													Globe($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----> <span>Sites</span>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tabs.Trigger) {
											$$renderer.push('<!--[-->');

											Tabs.Trigger($$renderer, {
												value: 'marketplace',
												class: 'data-[state=active]:shadow-mini dark:data-[state=active]:bg-muted h-8 rounded-[4px] bg-transparent py-2 data-[state=active]:bg-white flex gap-2',
												children: ($$renderer) => {
													Store($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----> <span>Marketplace</span>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Tabs.Content) {
								$$renderer.push('<!--[-->');

								Tabs.Content($$renderer, {
									value: 'sites',
									class: 'flex overflow-hidden h-full',
									children: ($$renderer) => {
										if (active_starters_group_sites() === undefined) {
											$$renderer.push(`<!--[0--><!--[-->`);

											const each_array = $.ensure_array_like(Array.from({ length: 6 }));

											for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
												let _ = each_array[$$index];

												Skeleton($$renderer, { class: 'aspect-video w-full' });
											}

											$$renderer.push(`<!--]-->`);
										} else if (starter_sites()?.length === 0) {
											$$renderer.push('<!--[1-->');

											EmptyState($$renderer, {
												class: 'h-full col-span-4',
												icon: Globe,
												title: 'No sites to display',
												description: 'You don\'t have any sites here yet. When you create one, you\'ll be able to use it as a starting point for other sites. In the meantime, check the marketplace.',
												button: {
													label: 'Open Marketplace',
													icon: Store,
													onclick: () => starter_tab = 'marketplace'
												}
											});
										} else {
											$$renderer.push(`<!--[-1--><div class="h-full md:border-r flex-1 flex flex-col"><div class="flex-1"><div class="p-2 text-xs text-muted-foreground">Groups</div> <ul class="p-2 pt-0 flex flex-col gap-1"><!--[-->`);

											const each_array_1 = $.ensure_array_like(all_site_groups() ?? []);

											for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
												let group = each_array_1[$$index_1];

												$$renderer.push(`<li><button${$.attr_class(`w-full text-left px-2 py-1 rounded-md hover:bg-accent hover:text-accent-foreground ${active_starters_group_id === group.id ? 'bg-accent text-accent-foreground' : ''}`)}>${$.escape(group.name)}</button></li>`);
											}

											$$renderer.push(`<!--]--></ul></div> <div class="border-t p-3">`);

											if (uploaded_snapshot_file) {
												$$renderer.push(`<!--[0--><div class="rounded-md border bg-muted/50 p-2 space-y-2"><div class="flex items-center gap-2">`);
												Check($$renderer, { class: 'h-4 w-4 text-primary flex-shrink-0' });
												$$renderer.push(`<!----> <span class="text-xs truncate">${$.escape(uploaded_snapshot_file.name)}</span></div> `);

												Button($$renderer, {
													variant: 'ghost',
													size: 'sm',
													class: 'w-full h-7 text-xs',
													onclick: clear_uploaded_file,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Remove`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----></div>`);
											} else {
												$$renderer.push(`<!--[-1--><label${$.attr_class(`flex items-center justify-center gap-2 w-full h-9 px-3 rounded-md border border-dashed cursor-pointer hover:bg-accent hover:border-accent-foreground/20 transition-colors text-sm text-muted-foreground hover:text-accent-foreground ${parsing_file ? 'opacity-50 pointer-events-none' : ''}`)}>`);

												if (parsing_file) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
													$$renderer.push(`<!----> <span>Reading...</span>`);
												} else {
													$$renderer.push('<!--[-1-->');
													Upload($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----> <span>Import .primo</span>`);
												}

												$$renderer.push(`<!--]--> <input type="file" class="hidden" accept=".primo,.pala"${$.attr('disabled', parsing_file, true)}/></label>`);
											}

											$$renderer.push(`<!--]--> `);

											if (file_upload_error) {
												$$renderer.push(`<!--[0--><p class="text-xs text-destructive mt-2">${$.escape(file_upload_error)}</p>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--></div></div> <div class="flex-4 overflow-auto">`);

											if (active_starters_group_sites()?.length === 0) {
												$$renderer.push(`<!--[0--><div class="text-sm text-muted-foreground p-6 text-center">No sites in this group.</div>`);
											} else if (active_starters_group_sites()) {
												$$renderer.push(`<!--[1--><div class="p-3 pr-0 grid gap-4 place-content-start sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"><!--[-->`);

												const each_array_2 = $.ensure_array_like(active_starters_group_sites());

												for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
													let site = each_array_2[$$index_2];

													StarterButton($$renderer, site);
												}

												$$renderer.push(`<!--]--></div>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--></div>`);
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Tabs.Content) {
								$$renderer.push('<!--[-->');

								Tabs.Content($$renderer, {
									value: 'marketplace',
									class: 'flex overflow-hidden h-full',
									children: ($$renderer) => {
										$$renderer.push(`<div class="h-full md:border-r flex-1"><div class="p-2 text-xs text-muted-foreground">Groups</div> <ul class="p-2 pt-0 flex flex-col gap-1"><!--[-->`);

										const each_array_3 = $.ensure_array_like(marketplace_site_groups() ?? []);

										for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
											let group = each_array_3[$$index_3];

											$$renderer.push(`<li><button${$.attr_class(`w-full text-left px-2 py-1 rounded-md hover:bg-accent hover:text-accent-foreground ${active_marketplace_starters_group_id === group.id ? 'bg-accent text-accent-foreground' : ''}`)}>${$.escape(group.name)}</button></li>`);
										}

										$$renderer.push(`<!--]--></ul></div> <div class="flex-4 overflow-auto"><div class="p-3 pr-0 grid gap-4 col-span-3 place-content-start sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">`);

										if (marketplace_starter_sites() === undefined) {
											$$renderer.push(`<!--[0--><!--[-->`);

											const each_array_4 = $.ensure_array_like(Array.from({ length: 6 }));

											for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
												let _ = each_array_4[$$index_4];

												Skeleton($$renderer, { class: 'aspect-video w-full' });
											}

											$$renderer.push(`<!--]-->`);
										} else {
											$$renderer.push(`<!--[-1--><!--[-->`);

											const each_array_5 = $.ensure_array_like(marketplace_starter_sites());

											for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
												let site = each_array_5[$$index_5];

												StarterButton($$renderer, site, 'marketplace');
											}

											$$renderer.push(`<!--]--> `);

											if ((marketplace_starter_sites()?.length ?? 0) === 0) {
												$$renderer.push(`<!--[0--><div class="text-sm text-muted-foreground p-6 text-center">No starters in this group.</div>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]-->`);
										}

										$$renderer.push(`<!--]--></div></div>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(`</div> <div class="flex-3"><div class="h-[73vh] rounded-md bg-muted/20 flex flex-col overflow-hidden">`);

							if (selected_starter_site()) {
								$$renderer.push('<!--[0-->');

								const preview_url = selected_starter_source === 'marketplace'
									? `https://${selected_starter_site()?.host}`
									: `/?_site=${selected_starter_site()?.id}`;

								$$renderer.push(`<div class="flex-1 min-h-0"><!---->`);

								{
									SitePreview($$renderer, {
										style: 'height: 100%; --thumbnail-height: 124%',
										site: selected_starter_site(),
										src: selected_starter_site() ? preview_url : ''
									});
								}

								$$renderer.push(`<!----></div> `);

								if (preview_url) {
									$$renderer.push(`<!--[0--><div class="px-3 py-2 text-xs text-right text-muted-foreground relative bg-[#111]"><a${$.attr('href', preview_url)} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 hover:text-foreground hover:underline"><span>Open live preview</span> `);
									ExternalLink($$renderer, { class: 'h-3 w-3', 'aria-hidden': 'true' });
									$$renderer.push(`<!----></a></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							} else if (uploaded_snapshot) {
								$$renderer.push(`<!--[1--><div class="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-8 text-center"><div class="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">`);
								Check($$renderer, { class: 'h-8 w-8 text-primary' });
								$$renderer.push(`<!----></div> <div><p class="font-medium">${$.escape(uploaded_snapshot.records.sites[0]?.name ?? 'Imported Site')}</p> <p class="text-sm text-muted-foreground mt-1">Ready to create</p></div></div>`);
							} else {
								$$renderer.push(`<!--[-1--><div class="flex-1 flex flex-col items-center justify-center gap-2 px-6 py-8 text-center"><p class="text-xs text-muted-foreground/80 max-w-[14rem]">Choose a starter site on the left to see a live preview here.</p></div>`);
							}

							$$renderer.push(`<!--]--></div></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (step === 'blocks') {
				$$renderer.push('<!--[0-->');

				BlockPickerPanel($$renderer, {
					get selected() {
						return selected_block_ids;
					},

					set selected($$value) {
						selected_block_ids = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="h-[10vh] bg-background pt-4 pb-4 flex items-center z-10"><div${$.attr_class($.clsx(step === 'name'
				? 'w-full max-w-lg mx-auto flex justify-end gap-3'
				: 'w-full max-w-[1400px] mx-auto flex justify-end gap-3'))}>`);

			Button($$renderer, {
				onclick: next_or_create,
				disabled: loading || step === 'name' && !can_go_starter() || step === 'starter' && !can_go_blocks() || step === 'blocks' && !completed(),
				class: 'inline-flex justify-center items-center relative gap-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(step === 'blocks' ? 'Done' : 'Next')}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div></div>  `);

			if (loading) {
				$$renderer.push(`<!--[0--><div class="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center"><div class="flex flex-col items-center gap-4">`);
				Loader($$renderer, { class: 'h-12 w-12 animate-spin text-primary' });
				$$renderer.push(`<!----> <p class="text-lg font-medium">${$.escape(progress_message)}</p></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (error_message) {
				$$renderer.push(`<!--[0--><div class="fixed bottom-4 right-4 z-50 max-w-md"><div class="bg-destructive text-destructive-foreground rounded-lg p-4 shadow-lg"><div class="flex items-start gap-3"><div class="flex-1"><p class="font-medium">Failed to create site</p> <p class="text-sm mt-1">${$.escape(error_message)}</p></div> <button class="text-destructive-foreground/80 hover:text-destructive-foreground"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}