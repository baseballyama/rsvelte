import 'svelte/internal/disclose-version';
import { Select } from "bits-ui";
import { generateTestId } from "../helpers/select";
import * as $ from 'svelte/internal/client';
import "../../app.css";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'items',
	'value',
	'open',
	'placeholder'
]);

var root = $.from_html(`<span><span data-testid="selection-type"> </span> <span data-testid="selection-value"> </span> <span data-testid="selection-label"> </span> <span data-testid="selection-disabled"> </span></span> <button type="button" data-testid="set-value-2">set value</button>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<main data-testid="main"><!></main>`);

export default function Select_value_child_test($$anchor, $$props) {
	$.push($$props, true);

	let items = $.prop($$props, 'items', 19, () => []),
		value = $.prop($$props, 'value', 7, ""),
		open = $.prop($$props, 'open', 7, false),
		placeholder = $.prop($$props, 'placeholder', 3, "Open Listbox"),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root_2();
	var node = $.child(main);

	$.component(node, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, $.spread_props(
			{
				get items() {
					return items();
				}
			},
			() => restProps,
			{
				type: 'single',
				get value() {
					return value();
				},

				set value($$value) {
					value($$value);
				},

				get open() {
					return open();
				},

				set open($$value) {
					open($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment = root_1();
					var node_1 = $.first_child(fragment);

					$.component(node_1, () => Select.Trigger, ($$anchor, Select_Trigger) => {
						Select_Trigger($$anchor, {
							'data-testid': 'trigger',
							children: ($$anchor, $$slotProps) => {
								var fragment_1 = $.comment();
								var node_2 = $.first_child(fragment_1);

								{
									const child = ($$anchor, $$arg0) => {
										let props = () => ($$arg0?.()).props;
										let selection = () => ($$arg0?.()).selection;
										let currentPlaceholder = () => ($$arg0?.()).placeholder;
										let disabled = () => ($$arg0?.()).disabled;
										var fragment_2 = root();
										var span = $.first_child(fragment_2);

										$.attribute_effect(span, () => ({ 'data-testid': 'value-node', ...props() }));

										var span_1 = $.child(span);
										var text = $.only_child(span_1, true);
										var span_2 = $.sibling(span_1, 2);
										var text_1 = $.only_child(span_2, true);
										var span_3 = $.sibling(span_2, 2);
										var text_2 = $.only_child(span_3, true);
										var span_4 = $.sibling(span_3, 2);
										var text_3 = $.only_child(span_4, true);

										$.reset(span);

										var button = $.sibling(span, 2);

										$.template_effect(() => {
											$.set_text(text, selection().type);
											$.set_text(text_1, selection().type === "single" && selection().selected ? selection().selected.value : "none");
											$.set_text(text_2, selection().type === "single" && selection().selected ? selection().selected.label : currentPlaceholder());
											$.set_text(text_3, disabled() ? "true" : "false");
										});

										$.delegated('pointerdown', button, (e) => e.stopPropagation());

										$.delegated('click', button, (e) => {
											e.stopPropagation();

											if (disabled() || selection().type !== "single") return;

											selection().setValue("2");
										});

										$.append($$anchor, fragment_2);
									};

									$.component(node_2, () => Select.Value, ($$anchor, Select_Value) => {
										Select_Value($$anchor, {
											get placeholder() {
												return placeholder();
											},
											child,
											$$slots: { child: true }
										});
									});
								}

								$.append($$anchor, fragment_1);
							},
							$$slots: { default: true }
						});
					});

					var node_3 = $.sibling(node_1, 2);

					$.component(node_3, () => Select.Portal, ($$anchor, Select_Portal) => {
						Select_Portal($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_4 = $.first_child(fragment_3);

								$.component(node_4, () => Select.Content, ($$anchor, Select_Content) => {
									Select_Content($$anchor, {
										'data-testid': 'content',
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_5 = $.first_child(fragment_4);

											$.component(node_5, () => Select.Group, ($$anchor, Select_Group) => {
												Select_Group($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = $.comment();
														var node_6 = $.first_child(fragment_5);

														$.each(node_6, 17, items, (item) => item.value, ($$anchor, item) => {
															var fragment_6 = $.comment();
															var node_7 = $.first_child(fragment_6);

															{
																let $0 = $.derived(() => generateTestId($.get(item).value));

																$.component(node_7, () => Select.Item, ($$anchor, Select_Item) => {
																	Select_Item($$anchor, {
																		get 'data-testid'() {
																			return $.get($0);
																		},

																		get value() {
																			return $.get(item).value;
																		},

																		get label() {
																			return $.get(item).label;
																		},

																		get disabled() {
																			return $.get(item).disabled;
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_4 = $.text();

																			$.template_effect(() => $.set_text(text_4, $.get(item).label));
																			$.append($$anchor, text_4);
																		},
																		$$slots: { default: true }
																	});
																});
															}

															$.append($$anchor, fragment_6);
														});

														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment);
				},
				$$slots: { default: true }
			}
		));
	});

	$.reset(main);
	$.append($$anchor, main);
	$.pop();
}

$.delegate(['pointerdown', 'click']);