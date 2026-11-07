import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputSelect, InputText } from '$lib/elements/forms';
import { last, symmetricDifference } from '$lib/helpers/array';
import { addNotification } from '$lib/stores/notifications';
import { columns } from '../store';
import { isTextType } from '../rows/store';
import { preferences } from '$lib/stores/preferences';
import { page } from '$app/state';
import { Icon, Layout } from '@appwrite.io/pink-svelte';
import { IconPlus, IconX } from '@appwrite.io/pink-icons-svelte';
import { organization } from '$lib/stores/organization';

var root = $.from_html(`<!> <span><!></span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div><!></div>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function DisplayName($$anchor, $$props) {
	$.push($$props, true);

	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const $columns = () => $.store_get(columns, '$columns', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const tableId = page.params.table;
	const displayNames = $.derived(() => preferences.getDisplayNames(tableId) ?? []);
	let names = $.state($.proxy(preferences.getDisplayNames(tableId) ?? []));

	async function updateDisplayName() {
		try {
			// $state makes proxy,
			// structuredClone doesn't work
			const regularArray = [...$.get(names)];

			await preferences.setDisplayNames($organization().$id, tableId, regularArray);
			$.set(names, $.get(displayNames), true);
			await invalidate(Dependencies.TEAM);
			addNotification({ message: 'Display names have been updated', type: 'success' });
			trackEvent(Submit.TableUpdateDisplayNames);
		} catch(error) {
			addNotification({ message: error.message, type: 'error' });
			trackError(error, Submit.TableUpdateDisplayNames);
		}
	}

	function getValidColumns() {
		return $columns().filter((attr) => isTextType(attr) && !attr?.array);
	}

	function getOptions(index) {
		const current = $.get(names)?.[index];

		return getValidColumns().filter((attr) => !$.get(names)?.includes(attr.key) || attr.key === current).map((attr) => ({ value: attr.key, label: attr.key }));
	}

	const addColumnDisabled = $.derived(() => $.get(names)?.length >= 5 || $.get(names)?.length && !$.get(names)[$.get(names)?.length - 1]);
	const updateBtnDisabled = $.derived(() => !symmetricDifference($.get(names), preferences.getDisplayNames(tableId))?.length || $.get(names)?.length && !last($.get(names)));
	const hasExhaustedOptions = $.derived(() => getValidColumns().length === $.get(names).filter(Boolean).length);

	Form($$anchor, {
		onSubmit: updateDisplayName,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Select up to 5 string columns to display as row names in the Appwrite console. These help identify\n        rows in places like relationships.');

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var text_1 = $.text('Display name');

						$.append($$anchor, text_1);
					},

					aside: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node = $.first_child(fragment_2);

						$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
							Layout_Stack($$anchor, {
								gap: 's',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_3();
									var node_1 = $.first_child(fragment_3);

									$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
										Layout_Stack_1($$anchor, {
											direction: 'row',
											gap: 'xxs',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_2 = $.first_child(fragment_4);

												InputText(node_2, { id: 'id', value: 'Row ID', readonly: true });

												var span = $.sibling(node_2, 2);

												$.set_style(span, '', {}, { visibility: 'hidden' });

												var node_3 = $.child(span);

												Button(node_3, {
													icon: true,
													extraCompact: true,
													children: ($$anchor, $$slotProps) => {
														Icon($$anchor, {
															get icon() {
																return IconX;
															}
														});
													},
													$$slots: { default: true }
												});

												$.reset(span);
												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									var node_4 = $.sibling(node_1, 2);

									{
										var consequent = ($$anchor) => {
											var fragment_6 = $.comment();
											var node_5 = $.first_child(fragment_6);

											$.each(node_5, 17, () => $.get(names), $.index, ($$anchor, name, index) => {
												var fragment_7 = $.comment();
												var node_6 = $.first_child(fragment_7);

												$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
													Layout_Stack_2($$anchor, {
														direction: 'row',
														gap: 'xxs',
														children: ($$anchor, $$slotProps) => {
															const options = $.derived(() => getOptions(index));
															const onlyId = $.derived(() => $.get(names).length === 1 && $.get(name) === '$id');
															const disabled = $.derived(() => !$.get(onlyId) && (!!$.get(names)[index] && $.get(names).length > index + 1 || $.get(hasExhaustedOptions)));
															var fragment_8 = root_1();
															var node_7 = $.first_child(fragment_8);

															InputSelect(node_7, {
																get id() {
																	return $.get(name);
																},

																get options() {
																	return $.get(options);
																},

																get disabled() {
																	return $.get(disabled);
																},
																placeholder: 'Select column',
																get value() {
																	return $.get(names)[index];
																},

																set value($$value) {
																	$.get(names)[index] = $$value;
																}
															});

															var node_8 = $.sibling(node_7, 2);

															Button(node_8, {
																icon: true,
																extraCompact: true,
																$$events: {
																	click: () => {
																		$.get(names).splice(index, 1);
																		$.set(names, $.get(names), true);
																	}
																},

																children: ($$anchor, $$slotProps) => {
																	Icon($$anchor, {
																		get icon() {
																			return IconX;
																		}
																	});
																},
																$$slots: { default: true }
															});

															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_7);
											});

											$.append($$anchor, fragment_6);
										};

										$.if(node_4, ($$render) => {
											if ($.get(names)?.length) $$render(consequent);
										});
									}

									var node_9 = $.sibling(node_4, 2);

									{
										var consequent_1 = ($$anchor) => {
											var div = root_2();
											var node_10 = $.child(div);

											Button(node_10, {
												compact: true,
												get disabled() {
													return $.get(addColumnDisabled);
												},

												$$events: {
													click: () => {
														$.get(names)[$.get(names).length] = null;
														$.set(names, $.get(names), true);
													}
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Add column');

													$.append($$anchor, text_2);
												},

												$$slots: {
													default: true,
													start: ($$anchor, $$slotProps) => {
														Icon($$anchor, {
															get icon() {
																return IconPlus;
															},
															slot: 'start',
															size: 's'
														});
													}
												}
											});

											$.reset(div);
											$.append($$anchor, div);
										};

										$.if(node_9, ($$render) => {
											if (!$.get(hasExhaustedOptions)) $$render(consequent_1);
										});
									}

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},

					actions: ($$anchor, $$slotProps) => {
						Button($$anchor, {
							get disabled() {
								return $.get(updateBtnDisabled);
							},
							submit: true,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text('Update');

								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}