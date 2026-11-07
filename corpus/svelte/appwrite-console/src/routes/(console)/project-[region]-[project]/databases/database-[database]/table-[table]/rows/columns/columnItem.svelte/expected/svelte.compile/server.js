import * as $ from 'svelte/internal/server';
import { Button } from '$lib/elements/forms';
import { capitalize } from '$lib/helpers/string';
import { Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import Column from './column.svelte';
import { writable } from 'svelte/store';

export default function ColumnItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			column,
			formValues = {},
			label,
			editing = false,
			fromSpreadsheet = false,
			onUpdateFormValues = null
		} = $$props;

		let formStore = writable(formValues ?? {});

		function removeArrayItem(key, index) {
			const currentArray = Array.isArray($.store_get($$store_subs ??= {}, '$formStore', formStore)[key])
				? $.store_get($$store_subs ??= {}, '$formStore', formStore)[key]
				: [];

			const filteredArray = currentArray.filter((_, i) => i !== index);

			formStore.update((values) => {
				values[key] = filteredArray.length === 0 ? [] : filteredArray;

				return values;
			});
		}

		function addArrayItem(key) {
			const currentArray = Array.isArray($.store_get($$store_subs ??= {}, '$formStore', formStore)[key])
				? $.store_get($$store_subs ??= {}, '$formStore', formStore)[key]
				: null;

			formStore.update((values) => {
				values[key] = currentArray ? [...currentArray, null] : [null];

				return values;
			});
		}

		function getColumnType(column) {
			if ('format' in column) {
				switch (column.format) {
					case 'ip':
						return 'IP';

					case 'email':
						return 'Email';

					case 'url':
						return 'URL';

					case 'enum':
						return 'Enum';

					default:
						return 'String';
				}
			}

			return `${capitalize(column.type)}${column.array ? '[]' : ''}`;
		}

		formStore.subscribe((values) => onUpdateFormValues?.(values));

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (column.array) {
				$$renderer.push('<!--[0-->');

				if ($.store_get($$store_subs ??= {}, '$formStore', formStore)[column.key]?.length === 0) {
					$$renderer.push('<!--[0-->');

					if (fromSpreadsheet) {
						$$renderer.push('<!--[0-->');

						Column($$renderer, {
							array: true,
							label,
							column,
							editing,
							id: column.key,
							limited: fromSpreadsheet,
							optionalText: getColumnType(column),
							get value() {
								return $.store_get($$store_subs ??= {}, '$formStore', formStore)[column.key];
							},

							set value($$value) {
								$.store_mutate($$store_subs ??= {}, '$formStore', formStore, $.store_get($$store_subs ??= {}, '$formStore', formStore)[column.key] = $$value);
								$$settled = false;
							}
						});
					} else {
						$$renderer.push('<!--[-1-->');

						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								direction: 'row',
								alignContent: 'space-between',
								children: ($$renderer) => {
									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											gap: 'xxs',
											direction: 'row',
											alignItems: 'center',
											children: ($$renderer) => {
												if (Typography.Text) {
													$$renderer.push('<!--[-->');

													Typography.Text($$renderer, {
														variant: 'm-500',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(label)}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Typography.Text) {
													$$renderer.push('<!--[-->');

													Typography.Text($$renderer, {
														variant: 'm-400',
														color: '--fgcolor-neutral-tertiary',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(getColumnType(column))}`);
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

									Button($$renderer, {
										secondary: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Add item`);
										},

										$$slots: {
											default: true,
											start: ($$renderer) => {
												Icon($$renderer, { icon: IconPlus, slot: 'start', size: 's' });
											}
										}
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
				} else if (fromSpreadsheet) {
					$$renderer.push('<!--[1-->');

					Column($$renderer, {
						array: true,
						label,
						column,
						editing,
						id: column.key,
						limited: fromSpreadsheet,
						optionalText: getColumnType(column),
						get value() {
							return $.store_get($$store_subs ??= {}, '$formStore', formStore)[column.key];
						},

						set value($$value) {
							$.store_mutate($$store_subs ??= {}, '$formStore', formStore, $.store_get($$store_subs ??= {}, '$formStore', formStore)[column.key] = $$value);
							$$settled = false;
						}
					});
				} else {
					$$renderer.push('<!--[-1-->');

					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like([
									...$.store_get($$store_subs ??= {}, '$formStore', formStore)[column.key]?.keys() ?? []
								]);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let index = each_array[$$index];

									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											direction: 'row',
											alignItems: 'flex-end',
											gap: 'xs',
											children: ($$renderer) => {
												Column($$renderer, {
													column,
													limited: fromSpreadsheet,
													id: `${column.key}-${index}`,
													optionalText: index === 0 ? getColumnType(column) : undefined,
													label: index === 0 ? label : '',
													get value() {
														return $.store_get($$store_subs ??= {}, '$formStore', formStore)[column.key][index];
													},

													set value($$value) {
														$.store_mutate($$store_subs ??= {}, '$formStore', formStore, $.store_get($$store_subs ??= {}, '$formStore', formStore)[column.key][index] = $$value);
														$$settled = false;
													}
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													text: true,
													icon: true,
													children: ($$renderer) => {
														$$renderer.push(`<span class="icon-x" aria-hidden="true"></span>`);
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

								$$renderer.push(`<!--]--> <div>`);

								Button($$renderer, {
									secondary: true,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Add item`);
									},

									$$slots: {
										default: true,
										start: ($$renderer) => {
											Icon($$renderer, { icon: IconPlus, slot: 'start', size: 's' });
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

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');

				Column($$renderer, {
					label,
					editing,
					column,
					id: column.key,
					limited: fromSpreadsheet,
					optionalText: getColumnType(column),
					get value() {
						return $.store_get($$store_subs ??= {}, '$formStore', formStore)[column.key];
					},

					set value($$value) {
						$.store_mutate($$store_subs ??= {}, '$formStore', formStore, $.store_get($$store_subs ??= {}, '$formStore', formStore)[column.key] = $$value);
						$$settled = false;
					}
				});
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

		$.bind_props($$props, { formValues });
	});
}