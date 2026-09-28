import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="icon primary svelte-1oh7pfp"><!></div>`);
var root_1 = $.from_html(`<div class="container svelte-1oh7pfp" style="margin-bottom: 1rem"><span class="primo--field-label">Head HTML</span> <!></div>`);
var root_2 = $.from_html(`<div class="icon secondary svelte-1oh7pfp"><!></div>`);
var root_3 = $.from_html(`<div class="container svelte-1oh7pfp"><span class="primo--field-label">Body Footer HTML</span> <!></div>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<main class="SiteEditor svelte-1oh7pfp"><!></main>`);
var root_6 = $.from_html(`<!> <!>`, 1);

export default function SiteEditor($$anchor, $$props) {
	$.push($$props, true);

	const $locale = () => $.store_get(locale, '$locale', $$stores);
	const $current_user = () => $.store_get(current_user, '$current_user', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let has_unsaved_changes = $.prop($$props, 'has_unsaved_changes', 15, false);
	const { value: site } = site_context.get();
	const fields = $.derived(() => site?.fields() ?? []);
	const entries = $.derived(() => site?.entries() ?? []);
	const site_data = $.derived(() => useContent(site, { target: 'cms' })?.[$locale()] ?? {});

	hide_dynamic_field_types_context.set(true);

	const initial_code = { head: site?.head, foot: site?.foot };
	const initial_data = _.cloneDeep($.get(site_data));
	let head = $.state($.proxy(site?.head || ''));
	let foot = $.state($.proxy(site?.foot || ''));
	let disableSave = $.state(false);

	beforeNavigate((nav) => {
		if (has_unsaved_changes()) {
			// Prevent navigation when there are unsaved changes
			nav.cancel();

			alert('You have unsaved changes. Please save before navigating away.');
		}
	});

	// Compare current state to initial data
	$.user_effect(() => {
		const code_changed = $.get(head) !== initial_code.head || $.get(foot) !== initial_code.foot;
		const data_changed = !_.isEqual(initial_data, $.get(site_data));

		has_unsaved_changes(code_changed || data_changed);
	});

	// Add beforeunload listener to warn about unsaved changes
	$.user_effect(() => {
		if (!browser) return;

		const handleBeforeUnload = (e) => {
			if (has_unsaved_changes()) {
				e.preventDefault();
				e.returnValue = '';

				return '';
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	});

	async function saveComponent() {
		if (!site) {
			return;
		}

		$.set(disableSave, true);

		try {
			Sites.update(site.id, { head: $.get(head), foot: $.get(foot) });
			await self.commit();
			console.log('Site saved successfully');

			if ($$props.onClose) $$props.onClose();
		} catch(error) {
			console.error('Error saving site:', error);

			throw error;
		} finally {
			$.set(disableSave, false);
		}
	}

	var fragment = root_6();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => ({
			label: 'Save',
			onclick: saveComponent,
			disabled: $.get(disableSave)
		}));

		$.component(node, () => Dialog.Header, ($$anchor, Dialog_Header) => {
			Dialog_Header($$anchor, {
				title: 'Site',
				icon: 'gg:website',
				get button() {
					return $.get($0);
				}
			});
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var main = root_5();
			var node_2 = $.child(main);

			{
				var consequent = ($$anchor) => {
					PaneGroup($$anchor, {
						direction: 'horizontal',
						style: 'display: flex;',
						autoSaveId: 'SiteEditor-horizontal',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_4();
							var node_3 = $.first_child(fragment_2);

							Pane(node_3, {
								defaultSize: 50,
								children: ($$anchor, $$slotProps) => {
									Fields($$anchor, {
										get entity() {
											return site;
										},

										get fields() {
											return $.get(fields);
										},

										get entries() {
											return $.get(entries);
										},

										create_field: async (data) => {
											// Get the highest index for fields at this level
											const siblingFields = ($.get(fields) ?? []).filter((f) => data?.parent ? f.parent === data.parent : !f.parent);

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
												fields: $.get(fields),
												entries: $.get(entries),
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

							var node_4 = $.sibling(node_3, 2);

							PaneResizer(node_4, {
								class: 'PaneResizer-primary',
								children: ($$anchor, $$slotProps) => {
									var div = root();
									var node_5 = $.child(div);

									Icon(node_5, { icon: 'mdi:drag-vertical-variant' });
									$.reset(div);
									$.append($$anchor, div);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_4, 2);

							Pane(node_6, {
								defaultSize: 50,
								children: ($$anchor, $$slotProps) => {
									PaneGroup($$anchor, {
										direction: 'vertical',
										autoSaveId: 'SiteEditor-vertical',
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root_4();
											var node_7 = $.first_child(fragment_5);

											Pane(node_7, {
												minSize: 1.4,
												children: ($$anchor, $$slotProps) => {
													var div_1 = root_1();
													var node_8 = $.sibling($.child(div_1), 2);

													CodeEditor(node_8, {
														mode: 'html',
														get value() {
															return $.get(head);
														},

														set value($$value) {
															$.set(head, $$value, true);
														},
														$$events: { save: saveComponent }
													});

													$.reset(div_1);
													$.append($$anchor, div_1);
												},
												$$slots: { default: true }
											});

											var node_9 = $.sibling(node_7, 2);

											PaneResizer(node_9, {
												class: 'PaneResizer-secondary',
												children: ($$anchor, $$slotProps) => {
													var div_2 = root_2();
													var node_10 = $.child(div_2);

													Icon(node_10, { icon: 'mdi:drag-horizontal-variant' });
													$.reset(div_2);
													$.append($$anchor, div_2);
												},
												$$slots: { default: true }
											});

											var node_11 = $.sibling(node_9, 2);

											Pane(node_11, {
												minSize: 1.4,
												children: ($$anchor, $$slotProps) => {
													var div_3 = root_3();
													var node_12 = $.sibling($.child(div_3), 2);

													CodeEditor(node_12, {
														mode: 'html',
														get value() {
															return $.get(foot);
														},

														set value($$value) {
															$.set(foot, $$value, true);
														},
														$$events: { save: saveComponent }
													});

													$.reset(div_3);
													$.append($$anchor, div_3);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				};

				var alternate = ($$anchor) => {
					Content($$anchor, {
						get entity() {
							return site;
						},

						get fields() {
							return $.get(fields);
						},

						get entries() {
							return $.get(entries);
						},

						oninput: (values) => {
							setFieldEntries({
								fields: $.get(fields),
								entries: $.get(entries),
								updateEntry: SiteEntries.update,
								createEntry: SiteEntries.create,
								values
							});
						},

						ondelete: (entry_id) => {
							SiteEntries.delete(entry_id);
						}
					});
				};

				$.if(node_2, ($$render) => {
					if ($current_user()?.siteRole === 'developer') $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(main);
			$.append($$anchor, main);
		};

		$.if(node_1, ($$render) => {
			if (site) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}