import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
import Checkbox from '@smui/checkbox';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <pre class="status"> </pre> <pre class="status"> </pre>`, 1);

export default function _RowSelection($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	let options = $.proxy([
		{
			name: 'Broom',
			description: 'A wooden handled broom.',
			price: 15
		},

		{
			name: 'Dust Pan',
			description: 'A plastic dust pan.',
			price: 8
		},

		{
			name: 'Mop',
			description: 'A strong, durable mop.',
			price: 18
		},

		{
			name: 'Horse',
			description: "She's got some miles on her.",
			price: 83
		},
		{ name: 'Bucket', description: 'A metal bucket.', price: 13 }
	]);

	let selected = $.state($.proxy([options[2]]));
	const selectedPrice = $.derived(() => $.get(selected).reduce((total, option) => option.price + total, 0));
	var fragment = root_2();
	var node = $.first_child(fragment);

	DataTable(node, {
		style: 'max-width: 100%;',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			Head(node_1, {
				children: ($$anchor, $$slotProps) => {
					Row($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_2 = $.first_child(fragment_3);

							Cell(node_2, {
								checkbox: true,
								children: ($$anchor, $$slotProps) => {
									Checkbox($$anchor, {});
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							Cell(node_3, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Name');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							Cell(node_4, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Description');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_5 = $.sibling(node_4, 2);

							Cell(node_5, {
								numeric: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Price');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_1, 2);

			Body(node_6, {
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = $.comment();
					var node_7 = $.first_child(fragment_5);

					$.each(node_7, 17, () => options, (option) => option.name, ($$anchor, option) => {
						Row($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_7 = root();
								var node_8 = $.first_child(fragment_7);

								Cell(node_8, {
									checkbox: true,
									children: ($$anchor, $$slotProps) => {
										Checkbox($$anchor, {
											get value() {
												return $.get(option);
											},

											get valueKey() {
												return $.get(option).name;
											},

											get group() {
												return $.get(selected);
											},

											set group($$value) {
												$.set(selected, $$value, true);
											}
										});
									},
									$$slots: { default: true }
								});

								var node_9 = $.sibling(node_8, 2);

								Cell(node_9, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text();

										$.template_effect(() => $.set_text(text_3, $.get(option).name));
										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});

								var node_10 = $.sibling(node_9, 2);

								Cell(node_10, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text();

										$.template_effect(() => $.set_text(text_4, $.get(option).description));
										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});

								var node_11 = $.sibling(node_10, 2);

								Cell(node_11, {
									numeric: true,
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text();

										$.template_effect(() => $.set_text(text_5, $.get(option).price));
										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_7);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var pre = $.sibling(node, 2);
	var text_6 = $.only_child(pre);
	var pre_1 = $.sibling(pre, 2);
	var text_7 = $.only_child(pre_1);

	$.template_effect(
		($0) => {
			$.set_text(text_6, `Selected: ${$0 ?? ''}`);
			$.set_text(text_7, `Total: ${$.get(selectedPrice) ?? ''}`);
		},
		[
			() => $.get(selected).map((option) => option.name).join(', ')
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}