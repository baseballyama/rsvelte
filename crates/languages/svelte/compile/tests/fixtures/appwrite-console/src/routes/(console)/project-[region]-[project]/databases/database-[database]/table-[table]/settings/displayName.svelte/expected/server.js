import * as $ from 'svelte/internal/server';
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

export default function DisplayName($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const tableId = page.params.table;
		const displayNames = $.derived(() => preferences.getDisplayNames(tableId) ?? []);
		let names = preferences.getDisplayNames(tableId) ?? [];

		async function updateDisplayName() {
			try {
				// $state makes proxy,
				// structuredClone doesn't work
				const regularArray = [...names];

				await preferences.setDisplayNames($.store_get($$store_subs ??= {}, '$organization', organization).$id, tableId, regularArray);
				names = displayNames();
				await invalidate(Dependencies.TEAM);
				addNotification({ message: 'Display names have been updated', type: 'success' });
				trackEvent(Submit.TableUpdateDisplayNames);
			} catch(error) {
				addNotification({ message: error.message, type: 'error' });
				trackError(error, Submit.TableUpdateDisplayNames);
			}
		}

		function getValidColumns() {
			return $.store_get($$store_subs ??= {}, '$columns', columns).filter((attr) => isTextType(attr) && !attr?.array);
		}

		function getOptions(index) {
			const current = names?.[index];

			return getValidColumns().filter((attr) => !names?.includes(attr.key) || attr.key === current).map((attr) => ({ value: attr.key, label: attr.key }));
		}

		const addColumnDisabled = $.derived(() => names?.length >= 5 || names?.length && !names[names?.length - 1]);
		const updateBtnDisabled = $.derived(() => !symmetricDifference(names, preferences.getDisplayNames(tableId))?.length || names?.length && !last(names));
		const hasExhaustedOptions = $.derived(() => getValidColumns().length === names.filter(Boolean).length);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updateDisplayName,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Select up to 5 string columns to display as row names in the Appwrite console. These help identify
        rows in places like relationships.`);
						},

						$$slots: {
							default: true,
							title: ($$renderer) => {
								{
									$$renderer.push(`Display name`);
								}
							},

							aside: ($$renderer) => {
								{
									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											gap: 's',
											children: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														direction: 'row',
														gap: 'xxs',
														children: ($$renderer) => {
															InputText($$renderer, { id: 'id', value: 'Row ID', readonly: true });
															$$renderer.push(`<!----> <span${$.attr_style('', { visibility: 'hidden' })}>`);

															Button($$renderer, {
																icon: true,
																extraCompact: true,
																children: ($$renderer) => {
																	Icon($$renderer, { icon: IconX });
																},
																$$slots: { default: true }
															});

															$$renderer.push(`<!----></span>`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (names?.length) {
													$$renderer.push(`<!--[0--><!--[-->`);

													const each_array = $.ensure_array_like(names);

													for (let index = 0, $$length = each_array.length; index < $$length; index++) {
														let name = each_array[index];

														if (Layout.Stack) {
															$$renderer.push('<!--[-->');

															Layout.Stack($$renderer, {
																direction: 'row',
																gap: 'xxs',
																children: ($$renderer) => {
																	const options = getOptions(index);
																	const onlyId = names.length === 1 && name === '$id';
																	const disabled = !onlyId && (!!names[index] && names.length > index + 1 || hasExhaustedOptions());

																	InputSelect($$renderer, {
																		id: name,
																		options,
																		disabled,
																		placeholder: 'Select column',
																		get value() {
																			return names[index];
																		},

																		set value($$value) {
																			names[index] = $$value;
																			$$settled = false;
																		}
																	});

																	$$renderer.push(`<!----> `);

																	Button($$renderer, {
																		icon: true,
																		extraCompact: true,
																		children: ($$renderer) => {
																			Icon($$renderer, { icon: IconX });
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push(`<!---->`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													}

													$$renderer.push(`<!--]-->`);
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--> `);

												if (!hasExhaustedOptions()) {
													$$renderer.push(`<!--[0--><div>`);

													Button($$renderer, {
														compact: true,
														disabled: addColumnDisabled(),
														children: ($$renderer) => {
															$$renderer.push(`<!---->Add column`);
														},

														$$slots: {
															default: true,
															start: ($$renderer) => {
																Icon($$renderer, { icon: IconPlus, slot: 'start', size: 's' });
															}
														}
													});

													$$renderer.push(`<!----></div>`);
												} else {
													$$renderer.push('<!--[-1-->');
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
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: updateBtnDisabled(),
										submit: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Update`);
										},
										$$slots: { default: true }
									});
								}
							}
						}
					});
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}