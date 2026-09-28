import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion } from "bits-ui";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div data-testid="value"> </div> <button data-testid="update-value">Update Value</button> <!>`, 1);

export default function Accordion_single_test_controlled($$anchor, $$props) {
	let disabled = $.prop($$props, 'disabled', 3, false),
		items = $.prop($$props, 'items', 19, () => []),
		valueProp = $.prop($$props, 'value', 3, "");

	let value = $.state($.proxy(valueProp()));
	var fragment = root_1();
	var div = $.first_child(fragment);
	var text = $.only_child(div, true);
	var button = $.sibling(div, 2);
	var node = $.sibling(button, 2);

	$.component(node, () => Accordion.Root, ($$anchor, Accordion_Root) => {
		Accordion_Root($$anchor, {
			type: 'single',
			get disabled() {
				return disabled();
			},
			'data-testid': 'root',
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.each(node_1, 17, items, ({ value, title, disabled, content, level }) => value, ($$anchor, $$item, $$index, $$array) => {
					let value = () => $.get($$item).value;
					let title = () => $.get($$item).title;
					let disabled = () => $.get($$item).disabled;
					let content = () => $.get($$item).content;
					let level = () => $.get($$item).level;
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => Accordion.Item, ($$anchor, Accordion_Item) => {
						Accordion_Item($$anchor, {
							get value() {
								return value();
							},

							get disabled() {
								return disabled();
							},

							get 'data-testid'() {
								return `${value() ?? ''}-item`;
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_3 = $.first_child(fragment_3);

								$.component(node_3, () => Accordion.Header, ($$anchor, Accordion_Header) => {
									Accordion_Header($$anchor, {
										get level() {
											return level();
										},

										get 'data-testid'() {
											return `${value() ?? ''}-header`;
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_4 = $.first_child(fragment_4);

											$.component(node_4, () => Accordion.Trigger, ($$anchor, Accordion_Trigger) => {
												Accordion_Trigger($$anchor, {
													get disabled() {
														return disabled();
													},

													get 'data-testid'() {
														return `${value() ?? ''}-trigger`;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text();

														$.template_effect(() => $.set_text(text_1, title()));
														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								var node_5 = $.sibling(node_3, 2);

								$.component(node_5, () => Accordion.Content, ($$anchor, Accordion_Content) => {
									Accordion_Content($$anchor, {
										get 'data-testid'() {
											return `${value() ?? ''}-content`;
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text();

											$.template_effect(() => $.set_text(text_2, content()));
											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.template_effect(() => $.set_text(text, $.get(value)));
	$.delegated('click', button, () => $.set(value, "item-1"));
	$.append($$anchor, fragment);
}

$.delegate(['click']);