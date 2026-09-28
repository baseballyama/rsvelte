import 'svelte/internal/disclose-version';
import { Select } from "bits-ui";
import { generateTestId } from "../helpers/select";
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
	'searchValue'
]);

var root = $.from_html(`<span>x</span>`);
var root_1 = $.from_html(`<!> `, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<main data-testid="main" class="flex flex-col gap-12"><!> <div data-testid="outside" style="bottom: 0px; right: 10px; position: absolute;">outside</div> <button data-testid="open-binding"> </button> <button data-testid="value-binding"><!></button></main> <div data-testid="portal-target" id="portal-target"></div>`, 1);

export default function Select_test($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 7, ""),
		open = $.prop($$props, 'open', 7, false),
		searchValue = $.prop($$props, 'searchValue', 3, ""),
		restProps = $.rest_props($$props, rest_excludes);

	const filteredItems = $.derived(() => searchValue() === ""
		? $$props.items
		: $$props.items.filter((item) => item.label.toLowerCase().includes(searchValue().toLowerCase())));

	const selectedLabel = $.derived(() => value()
		? $$props.items.find((item) => item.value === value())?.label
		: "Open Listbox");

	var fragment = root_3();
	var main = $.first_child(fragment);
	var node = $.child(main);

	$.component(node, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, $.spread_props(() => restProps, {
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
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						'data-testid': 'trigger',
						class: 'p-2',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, $.get(selectedLabel)));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Select.Portal, ($$anchor, Select_Portal) => {
					Select_Portal($$anchor, $.spread_props(() => $$props.portalProps, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							$.component(node_3, () => Select.Content, ($$anchor, Select_Content) => {
								Select_Content($$anchor, $.spread_props({ 'data-testid': 'content' }, () => $$props.contentProps, {
									class: 'bg-white p-4',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_4 = $.first_child(fragment_4);

										$.component(node_4, () => Select.Group, ($$anchor, Select_Group) => {
											Select_Group($$anchor, {
												'data-testid': 'group',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_2();
													var node_5 = $.first_child(fragment_5);

													$.component(node_5, () => Select.GroupHeading, ($$anchor, Select_GroupHeading) => {
														Select_GroupHeading($$anchor, {
															'data-testid': 'group-label',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('Options');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													var node_6 = $.sibling(node_5, 2);

													$.each(node_6, 17, () => $.get(filteredItems), ({ value, label, disabled }) => value, ($$anchor, $$item, $$index, $$array) => {
														let value = () => $.get($$item).value;
														let label = () => $.get($$item).label;
														let disabled = () => $.get($$item).disabled;
														const testId = $.derived(() => generateTestId(value()));
														var fragment_6 = $.comment();
														var node_7 = $.first_child(fragment_6);

														{
															const children = ($$anchor, $$arg0) => {
																let selected = () => ($$arg0?.()).selected;
																let _highlighted = () => ($$arg0?.()).highlighted;
																var fragment_7 = root_1();
																var node_8 = $.first_child(fragment_7);

																{
																	var consequent = ($$anchor) => {
																		var span = root();

																		$.template_effect(() => $.set_attribute(span, 'data-testid', `${$.get(testId) ?? ''}-indicator`));
																		$.append($$anchor, span);
																	};

																	$.if(node_8, ($$render) => {
																		if (selected()) $$render(consequent);
																	});
																}

																var text_2 = $.sibling(node_8);

																$.template_effect(() => $.set_text(text_2, ` ${label() ?? ''}`));
																$.append($$anchor, fragment_7);
															};

															$.component(node_7, () => Select.Item, ($$anchor, Select_Item) => {
																Select_Item($$anchor, {
																	get 'data-testid'() {
																		return $.get(testId);
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
																	class: 'p-2',
																	children,
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
								}));
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					}));
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	var button = $.sibling(node, 4);
	var text_3 = $.only_child(button, true);
	var button_1 = $.sibling(button, 2);
	var node_9 = $.child(button_1);

	{
		var consequent_1 = ($$anchor) => {
			var text_4 = $.text('empty');

			$.append($$anchor, text_4);
		};

		var alternate = ($$anchor) => {
			var text_5 = $.text();

			$.template_effect(() => $.set_text(text_5, value()));
			$.append($$anchor, text_5);
		};

		$.if(node_9, ($$render) => {
			if (value() === "") $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(button_1);
	$.reset(main);
	$.next(2);
	$.template_effect(() => $.set_text(text_3, open()));
	$.delegated('click', button, () => open(!open()));
	$.delegated('click', button_1, () => value(""));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);