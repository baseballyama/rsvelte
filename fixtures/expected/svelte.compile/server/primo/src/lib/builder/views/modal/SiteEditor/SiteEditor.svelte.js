import * as $ from 'svelte/internal/server';
import * as Dialog from '$lib/components/ui/dialog';
import Icon from '@iconify/svelte';
import { PaneGroup, Pane, PaneResizer } from 'paneforge';
import Fields, { setFieldEntries } from '$lib/builder/components/Fields/FieldsContent.svelte';
import Content from '$lib/builder/components/Content.svelte';
import * as _ from 'lodash-es';
import CodeEditor from '$lib/builder/components/CodeEditor/CodeMirror.svelte';
import { site_context, hide_dynamic_field_types_context } from '$lib/builder/stores/context';
import { Sites, SiteFields, SiteEntries } from '$lib/pocketbase/collections';
import { current_user } from '$lib/pocketbase/user';
import { browser } from '$app/environment';
import { useContent } from '$lib/Content.svelte';
import { locale } from '$lib/builder/stores/app/misc.js';
import { self } from '$lib/pocketbase/managers';
import { beforeNavigate } from '$app/navigation';

export default function SiteEditor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { onClose, has_unsaved_changes = false } = $$props;
		const { value: site } = site_context.get();
		const fields = $.derived(() => site?.fields() ?? []);
		const entries = $.derived(() => site?.entries() ?? []);
		const site_data = $.derived(() => useContent(site, { target: 'cms' })?.[$.store_get($$store_subs ??= {}, '$locale', locale)] ?? {});

		hide_dynamic_field_types_context.set(true);

		const initial_code = { head: site?.head, foot: site?.foot };
		const initial_data = _.cloneDeep(site_data());
		let head = site?.head || '';
		let foot = site?.foot || '';
		let disableSave = false;

		beforeNavigate((nav) => {
			if (has_unsaved_changes) {
				// Prevent navigation when there are unsaved changes
				nav.cancel();

				alert('You have unsaved changes. Please save before navigating away.');
			}
		});

		// Compare current state to initial data
		// Add beforeunload listener to warn about unsaved changes
		async function saveComponent() {
			if (!site) {
				return;
			}

			disableSave = true;

			try {
				Sites.update(site.id, { head, foot });
				await self.commit();
				console.log('Site saved successfully');

				if (onClose) onClose();
			} catch(error) {
				console.error('Error saving site:', error);

				throw error;
			} finally {
				disableSave = false;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Dialog.Header) {
				$$renderer.push('<!--[-->');

				Dialog.Header($$renderer, {
					title: 'Site',
					icon: 'gg:website',
					button: { label: 'Save', onclick: saveComponent, disabled: disableSave }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (site) {
				$$renderer.push(`<!--[0--><main class="SiteEditor svelte-1oh7pfp">`);

				if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole === 'developer') {
					$$renderer.push('<!--[0-->');

					PaneGroup($$renderer, {
						direction: 'horizontal',
						style: 'display: flex;',
						autoSaveId: 'SiteEditor-horizontal',
						children: ($$renderer) => {
							Pane($$renderer, {
								defaultSize: 50,
								children: ($$renderer) => {
									Fields($$renderer, {
										entity: site,
										fields: fields(),
										entries: entries(),
										create_field: async (data) => {
											// Get the highest index for fields at this level
											const siblingFields = (fields() ?? []).filter((f) => data?.parent ? f.parent === data.parent : !f.parent);

											const nextIndex = Math.max(...siblingFields.map((f) => f.index || 0), -1) + 1;

											SiteFields.create({
												type: 'text',
												key: '',
												label: '',
												config: null,
												site: site.id,
												...data,
												index: nextIndex
											});
										},

										oninput: (values) => {
											setFieldEntries({
												fields: fields(),
												entries: entries(),
												updateEntry: SiteEntries.update,
												createEntry: SiteEntries.create,
												values
											});
										},

										onchange: ({ id, data }) => {
											SiteFields.update(id, data);
										},

										ondelete: (field) => {
											SiteFields.delete(field.id);
										},

										ondelete_entry: (entry_id) => {
											SiteEntries.delete(entry_id);
										}
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							PaneResizer($$renderer, {
								class: 'PaneResizer-primary',
								children: ($$renderer) => {
									$$renderer.push(`<div class="icon primary svelte-1oh7pfp">`);
									Icon($$renderer, { icon: 'mdi:drag-vertical-variant' });
									$$renderer.push(`<!----></div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Pane($$renderer, {
								defaultSize: 50,
								children: ($$renderer) => {
									PaneGroup($$renderer, {
										direction: 'vertical',
										autoSaveId: 'SiteEditor-vertical',
										children: ($$renderer) => {
											Pane($$renderer, {
												minSize: 1.4,
												children: ($$renderer) => {
													$$renderer.push(`<div class="container svelte-1oh7pfp" style="margin-bottom: 1rem"><span class="primo--field-label">Head HTML</span> `);

													CodeEditor($$renderer, {
														mode: 'html',
														get value() {
															return head;
														},

														set value($$value) {
															head = $$value;
															$$settled = false;
														}
													});

													$$renderer.push(`<!----></div>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											PaneResizer($$renderer, {
												class: 'PaneResizer-secondary',
												children: ($$renderer) => {
													$$renderer.push(`<div class="icon secondary svelte-1oh7pfp">`);
													Icon($$renderer, { icon: 'mdi:drag-horizontal-variant' });
													$$renderer.push(`<!----></div>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Pane($$renderer, {
												minSize: 1.4,
												children: ($$renderer) => {
													$$renderer.push(`<div class="container svelte-1oh7pfp"><span class="primo--field-label">Body Footer HTML</span> `);

													CodeEditor($$renderer, {
														mode: 'html',
														get value() {
															return foot;
														},

														set value($$value) {
															foot = $$value;
															$$settled = false;
														}
													});

													$$renderer.push(`<!----></div>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');

					Content($$renderer, {
						entity: site,
						fields: fields(),
						entries: entries(),
						oninput: (values) => {
							setFieldEntries({
								fields: fields(),
								entries: entries(),
								updateEntry: SiteEntries.update,
								createEntry: SiteEntries.create,
								values
							});
						},

						ondelete: (entry_id) => {
							SiteEntries.delete(entry_id);
						}
					});
				}

				$$renderer.push(`<!--]--></main>`);
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { has_unsaved_changes });
	});
}