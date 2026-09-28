import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/elements/forms';
import { capitalize } from '$lib/helpers/string';
import { Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import Column from './column.svelte';
import { writable } from 'svelte/store';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span class="icon-x" aria-hidden="true"></span>`);
var root_2 = $.from_html(`<!> <div><!></div>`, 1);

export default function ColumnItem($$anchor, $$props) {
	$.push($$props, true);

	const $formStore = () => $.store_get(formStore, '$formStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let formValues = $.prop($$props, 'formValues', 27, () => $.proxy({})),
		editing = $.prop($$props, 'editing', 3, false),
		fromSpreadsheet = $.prop($$props, 'fromSpreadsheet', 3, false),
		onUpdateFormValues = $.prop($$props, 'onUpdateFormValues', 3, null);

	let formStore = writable(formValues() ?? {});

	function removeArrayItem(key, index) {
		const currentArray = Array.isArray($formStore()[key]) ? $formStore()[key] : [];
		const filteredArray = currentArray.filter((_, i) => i !== index);

		formStore.update((values) => {
			values[key] = filteredArray.length === 0 ? [] : filteredArray;

			return values;
		});
	}

	function addArrayItem(key) {
		const currentArray = Array.isArray($formStore()[key]) ? $formStore()[key] : null;

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

	formStore.subscribe((values) => onUpdateFormValues()?.(values));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							{
								let $0 = $.derived(() => getColumnType($$props.column));

								Column($$anchor, {
									array: true,
									get label() {
										return $$props.label;
									},

									get column() {
										return $$props.column;
									},

									get editing() {
										return editing();
									},

									get id() {
										return $$props.column.key;
									},

									get limited() {
										return fromSpreadsheet();
									},

									get optionalText() {
										return $.get($0);
									},

									get value() {
										return $formStore()[$$props.column.key];
									},

									set value($$value) {
										$.store_mutate(formStore, $.untrack($formStore)[$$props.column.key] = $$value, $.untrack($formStore));
									},

									$$events: {
										click: function ($$arg) {
											$.bubble_event.call(this, $$props, $$arg);
										}
									}
								});
							}
						};

						var alternate = ($$anchor) => {
							var fragment_4 = $.comment();
							var node_3 = $.first_child(fragment_4);

							$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack) => {
								Layout_Stack($$anchor, {
									direction: 'row',
									alignContent: 'space-between',
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root();
										var node_4 = $.first_child(fragment_5);

										$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
											Layout_Stack_1($$anchor, {
												gap: 'xxs',
												direction: 'row',
												alignItems: 'center',
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root();
													var node_5 = $.first_child(fragment_6);

													$.component(node_5, () => Typography.Text, ($$anchor, Typography_Text) => {
														Typography_Text($$anchor, {
															variant: 'm-500',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text();

																$.template_effect(() => $.set_text(text, $$props.label));
																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													});

													var node_6 = $.sibling(node_5, 2);

													$.component(node_6, () => Typography.Text, ($$anchor, Typography_Text_1) => {
														Typography_Text_1($$anchor, {
															variant: 'm-400',
															color: '--fgcolor-neutral-tertiary',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text();

																$.template_effect(($0) => $.set_text(text_1, $0), [() => getColumnType($$props.column)]);
																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_4, 2);

										Button(node_7, {
											secondary: true,
											$$events: { click: () => addArrayItem($$props.column.key) },
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Add item');

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

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_4);
						};

						$.if(node_2, ($$render) => {
							if (fromSpreadsheet()) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_2);
				};

				var consequent_2 = ($$anchor) => {
					{
						let $0 = $.derived(() => getColumnType($$props.column));

						Column($$anchor, {
							array: true,
							get label() {
								return $$props.label;
							},

							get column() {
								return $$props.column;
							},

							get editing() {
								return editing();
							},

							get id() {
								return $$props.column.key;
							},

							get limited() {
								return fromSpreadsheet();
							},

							get optionalText() {
								return $.get($0);
							},

							get value() {
								return $formStore()[$$props.column.key];
							},

							set value($$value) {
								$.store_mutate(formStore, $.untrack($formStore)[$$props.column.key] = $$value, $.untrack($formStore));
							},

							$$events: {
								click: function ($$arg) {
									$.bubble_event.call(this, $$props, $$arg);
								}
							}
						});
					}
				};

				var alternate_1 = ($$anchor) => {
					var fragment_11 = $.comment();
					var node_8 = $.first_child(fragment_11);

					$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
						Layout_Stack_2($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_12 = root_2();
								var node_9 = $.first_child(fragment_12);

								$.each(node_9, 1, () => [...$formStore()[$$props.column.key]?.keys() ?? []], (index) => index, ($$anchor, index) => {
									var fragment_13 = $.comment();
									var node_10 = $.first_child(fragment_13);

									$.component(node_10, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
										Layout_Stack_3($$anchor, {
											direction: 'row',
											alignItems: 'flex-end',
											gap: 'xs',
											children: ($$anchor, $$slotProps) => {
												var fragment_14 = root();
												var node_11 = $.first_child(fragment_14);

												{
													let $0 = $.derived(() => `${$$props.column.key}-${$.get(index)}`);
													let $1 = $.derived(() => $.get(index) === 0 ? getColumnType($$props.column) : undefined);
													let $2 = $.derived(() => $.get(index) === 0 ? $$props.label : '');

													Column(node_11, {
														get column() {
															return $$props.column;
														},

														get limited() {
															return fromSpreadsheet();
														},

														get id() {
															return $.get($0);
														},

														get optionalText() {
															return $.get($1);
														},

														get label() {
															return $.get($2);
														},

														get value() {
															return $formStore()[$$props.column.key][$.get(index)];
														},

														set value($$value) {
															$.store_mutate(formStore, $.untrack($formStore)[$$props.column.key][$.get(index)] = $$value, $.untrack($formStore));
														}
													});
												}

												var node_12 = $.sibling(node_11, 2);

												Button(node_12, {
													text: true,
													icon: true,
													$$events: {
														click: () => removeArrayItem($$props.column.key, $.get(index))
													},

													children: ($$anchor, $$slotProps) => {
														var span = root_1();

														$.append($$anchor, span);
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_14);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_13);
								});

								var div = $.sibling(node_9, 2);
								var node_13 = $.child(div);

								Button(node_13, {
									secondary: true,
									$$events: { click: () => addArrayItem($$props.column.key) },
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Add item');

										$.append($$anchor, text_3);
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
								$.append($$anchor, fragment_12);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_11);
				};

				$.if(node_1, ($$render) => {
					if ($formStore()[$$props.column.key]?.length === 0) $$render(consequent_1); else if (fromSpreadsheet()) $$render(consequent_2, 1); else $$render(alternate_1, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		var alternate_2 = ($$anchor) => {
			{
				let $0 = $.derived(() => getColumnType($$props.column));

				Column($$anchor, {
					get label() {
						return $$props.label;
					},

					get editing() {
						return editing();
					},

					get column() {
						return $$props.column;
					},

					get id() {
						return $$props.column.key;
					},

					get limited() {
						return fromSpreadsheet();
					},

					get optionalText() {
						return $.get($0);
					},

					get value() {
						return $formStore()[$$props.column.key];
					},

					set value($$value) {
						$.store_mutate(formStore, $.untrack($formStore)[$$props.column.key] = $$value, $.untrack($formStore));
					},

					$$events: {
						click: function ($$arg) {
							$.bubble_event.call(this, $$props, $$arg);
						}
					}
				});
			}
		};

		$.if(node, ($$render) => {
			if ($$props.column.array) $$render(consequent_3); else $$render(alternate_2, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}