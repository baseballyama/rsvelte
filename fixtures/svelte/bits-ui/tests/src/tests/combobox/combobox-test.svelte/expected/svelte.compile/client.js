import 'svelte/internal/disclose-version';
import { Combobox } from "bits-ui";
import * as $ from 'svelte/internal/client';
import "../../app.css";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'contentProps',
	'portalProps',
	'items',
	'value',
	'open',
	'searchValue',
	'inputProps',
	'onOpenChange'
]);

var root = $.from_html(`<span>x</span>`);
var root_1 = $.from_html(`<!> `, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<main data-testid="main" class="flex flex-col gap-12"><!> <div data-testid="outside" style="bottom: 0px; right: 10px; position: absolute;">outside</div> <button data-testid="input-binding"><!></button> <button data-testid="open-binding"> </button> <button data-testid="value-binding"><!></button> <button data-testid="value-binding-3">set 3</button></main> <div data-testid="portal-target" id="portal-target"></div>`, 1);

export default function Combobox_test($$anchor, $$props) {
	$.push($$props, true);

	let items = $.prop($$props, 'items', 19, () => []),
		value = $.prop($$props, 'value', 7, ""),
		open = $.prop($$props, 'open', 7, false),
		searchValue = $.prop($$props, 'searchValue', 7, ""),
		restProps = $.rest_props($$props, rest_excludes);

	const filteredItems = $.derived(() => searchValue() === ""
		? items()
		: items().filter((item) => item.label.includes(searchValue().toLowerCase())));

	const inputValue = $.derived(() => {
		return items().find((item) => item.value === value())?.label;
	});

	var fragment = root_4();
	var main = $.first_child(fragment);
	var node = $.child(main);

	$.component(node, () => Combobox.Root, ($$anchor, Combobox_Root) => {
		Combobox_Root($$anchor, $.spread_props(
			{
				type: 'single',
				get inputValue() {
					return $.get(inputValue);
				}
			},
			() => restProps,
			{
				onOpenChange: (v) => {
					$$props.onOpenChange?.(v);

					if (!v) searchValue("");
				},

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
					var fragment_1 = root_3();
					var node_1 = $.first_child(fragment_1);

					$.component(node_1, () => Combobox.Trigger, ($$anchor, Combobox_Trigger) => {
						Combobox_Trigger($$anchor, {
							'data-testid': 'trigger',
							class: 'p-4',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Open combobox');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => Combobox.Input, ($$anchor, Combobox_Input) => {
						Combobox_Input($$anchor, $.spread_props(
							{
								'data-testid': 'input',
								'aria-label': 'open combobox',
								oninput: (e) => searchValue(e.currentTarget.value)
							},
							() => $$props.inputProps
						));
					});

					var node_3 = $.sibling(node_2, 2);

					$.component(node_3, () => Combobox.Portal, ($$anchor, Combobox_Portal) => {
						Combobox_Portal($$anchor, $.spread_props(() => $$props.portalProps, {
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = $.comment();
								var node_4 = $.first_child(fragment_2);

								$.component(node_4, () => Combobox.Content, ($$anchor, Combobox_Content) => {
									Combobox_Content($$anchor, $.spread_props({ 'data-testid': 'content' }, () => $$props.contentProps, {
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = $.comment();
											var node_5 = $.first_child(fragment_3);

											$.component(node_5, () => Combobox.Group, ($$anchor, Combobox_Group) => {
												Combobox_Group($$anchor, {
													'data-testid': 'group',
													children: ($$anchor, $$slotProps) => {
														var fragment_4 = root_2();
														var node_6 = $.first_child(fragment_4);

														$.component(node_6, () => Combobox.GroupHeading, ($$anchor, Combobox_GroupHeading) => {
															Combobox_GroupHeading($$anchor, {
																'data-testid': 'group-label',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_1 = $.text('Options');

																	$.append($$anchor, text_1);
																},
																$$slots: { default: true }
															});
														});

														var node_7 = $.sibling(node_6, 2);

														$.each(node_7, 17, () => $.get(filteredItems), $.index, ($$anchor, $$item, i, $$array) => {
															let value = () => $.get($$item).value;
															let label = () => $.get($$item).label;
															let disabled = () => $.get($$item).disabled;
															var fragment_5 = $.comment();
															var node_8 = $.first_child(fragment_5);

															{
																const children = ($$anchor, $$arg0) => {
																	let selected = () => ($$arg0?.()).selected;
																	let _highlighted = () => ($$arg0?.()).highlighted;
																	var fragment_6 = root_1();
																	var node_9 = $.first_child(fragment_6);

																	{
																		var consequent = ($$anchor) => {
																			var span = root();

																			$.template_effect(() => $.set_attribute(span, 'data-testid', `${value() ?? ''}-indicator`));
																			$.append($$anchor, span);
																		};

																		$.if(node_9, ($$render) => {
																			if (selected()) $$render(consequent);
																		});
																	}

																	var text_2 = $.sibling(node_9);

																	$.template_effect(() => $.set_text(text_2, ` ${label() ?? ''}`));
																	$.append($$anchor, fragment_6);
																};

																$.component(node_8, () => Combobox.Item, ($$anchor, Combobox_Item) => {
																	Combobox_Item($$anchor, {
																		get 'data-testid'() {
																			return value();
																		},

																		get disabled() {
																			return disabled();
																		},

																		get value() {
																			return value();
																		},

																		get label() {
																			return label();
																		},
																		class: 'data-highlighted:bg-red-500 data-highlighted:text-white data-selected:bg-blue-500 data-selected:text-white p-2',
																		children,
																		$$slots: { default: true }
																	});
																});
															}

															$.append($$anchor, fragment_5);
														});

														$.append($$anchor, fragment_4);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									}));
								});

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						}));
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	});

	var button = $.sibling(node, 4);
	var node_10 = $.child(button);

	{
		var consequent_1 = ($$anchor) => {
			var text_3 = $.text('empty');

			$.append($$anchor, text_3);
		};

		var alternate = ($$anchor) => {
			var text_4 = $.text();

			$.template_effect(() => $.set_text(text_4, searchValue()));
			$.append($$anchor, text_4);
		};

		$.if(node_10, ($$render) => {
			if (searchValue() === "") $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(button);

	var button_1 = $.sibling(button, 2);
	var text_5 = $.only_child(button_1, true);
	var button_2 = $.sibling(button_1, 2);
	var node_11 = $.child(button_2);

	{
		var consequent_2 = ($$anchor) => {
			var text_6 = $.text('empty');

			$.append($$anchor, text_6);
		};

		var alternate_1 = ($$anchor) => {
			var text_7 = $.text();

			$.template_effect(() => $.set_text(text_7, value()));
			$.append($$anchor, text_7);
		};

		$.if(node_11, ($$render) => {
			if (value() === "") $$render(consequent_2); else $$render(alternate_1, -1);
		});
	}

	$.reset(button_2);

	var button_3 = $.sibling(button_2, 2);

	$.reset(main);
	$.next(2);
	$.template_effect(() => $.set_text(text_5, open()));
	$.delegated('click', button, () => searchValue(""));
	$.delegated('click', button_1, () => open(!open()));
	$.delegated('click', button_2, () => value(""));
	$.delegated('click', button_3, () => value("3"));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);