import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Input from "$lib/registry/ui/input/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex w-full gap-2"><!> <!></div>`);

export default function Input_with_select($$anchor, $$props) {
	$.push($$props, true);

	const currencyItems = [
		{ label: "USD", value: "usd" },
		{ label: "EUR", value: "eur" },
		{ label: "GBP", value: "gbp" }
	];

	let currency = $.state($.proxy(currencyItems[0].value));
	const currencyLabel = $.derived(() => currencyItems.find((item) => item.value === $.get(currency))?.label ?? "USD");

	Example($$anchor, {
		title: 'With Select',
		children: ($$anchor, $$slotProps) => {
			var div = root_2();
			var node = $.child(div);

			$.component(node, () => Input.Root, ($$anchor, Input_Root) => {
				Input_Root($$anchor, { type: 'text', placeholder: 'Enter amount', class: 'flex-1' });
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Select.Root, ($$anchor, Select_Root) => {
				Select_Root($$anchor, {
					type: 'single',
					get value() {
						return $.get(currency);
					},

					set value($$value) {
						$.set(currency, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_1();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Select.Trigger, ($$anchor, Select_Trigger) => {
							Select_Trigger($$anchor, {
								class: 'w-32',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text();

									$.template_effect(() => $.set_text(text, $.get(currencyLabel)));
									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Select.Content, ($$anchor, Select_Content) => {
							Select_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_4 = $.first_child(fragment_3);

									$.component(node_4, () => Select.Item, ($$anchor, Select_Item) => {
										Select_Item($$anchor, {
											value: 'usd',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('USD');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => Select.Item, ($$anchor, Select_Item_1) => {
										Select_Item_1($$anchor, {
											value: 'eur',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('EUR');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_5, 2);

									$.component(node_6, () => Select.Item, ($$anchor, Select_Item_2) => {
										Select_Item_2($$anchor, {
											value: 'gbp',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('GBP');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}