import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ColumnItem from './columnItem.svelte';
import CustomId from '$lib/components/customId.svelte';
import { IconPencil } from '@appwrite.io/pink-icons-svelte';
import { Icon, Layout, Tag } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<span><!></span>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function ColumnForm($$anchor, $$props) {
	$.push($$props, true);

	let columns = $.prop($$props, 'columns', 19, () => []),
		formValues = $.prop($$props, 'formValues', 31, () => $.proxy({})),
		customId = $.prop($$props, 'customId', 15, undefined);

	let showCustomId = $.state(false);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_2 = $.first_child(fragment_2);

						$.each(node_2, 17, columns, $.index, ($$anchor, column) => {
							const label = $.derived(() => $.get(column).key);

							ColumnItem($$anchor, {
								get label() {
									return $.get(label);
								},

								get column() {
									return $.get(column);
								},

								get formValues() {
									return formValues();
								},
								onUpdateFormValues: (values) => formValues(values)
							});
						});

						var node_3 = $.sibling(node_2, 2);

						{
							var consequent_1 = ($$anchor) => {
								var fragment_4 = $.comment();
								var node_4 = $.first_child(fragment_4);

								{
									var consequent = ($$anchor) => {
										var span = root();
										var node_5 = $.child(span);

										Tag(node_5, {
											size: 's',
											$$events: { click: () => $.set(showCustomId, !$.get(showCustomId)) },
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Row ID');

												$.append($$anchor, text);
											},

											$$slots: {
												default: true,
												start: ($$anchor, $$slotProps) => {
													Icon($$anchor, {
														get icon() {
															return IconPencil;
														},
														slot: 'start',
														size: 's'
													});
												}
											}
										});

										$.reset(span);
										$.append($$anchor, span);
									};

									var alternate = ($$anchor) => {
										CustomId($$anchor, {
											autofocus: true,
											name: 'Row',
											get show() {
												return $.get(showCustomId);
											},

											set show($$value) {
												$.set(showCustomId, $$value, true);
											},

											get id() {
												return customId();
											},

											set id($$value) {
												customId($$value);
											}
										});
									};

									$.if(node_4, ($$render) => {
										if (!$.get(showCustomId)) $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_4);
							};

							$.if(node_3, ($$render) => {
								if (customId() !== undefined) $$render(consequent_1);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (columns().length) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}