import 'svelte/internal/disclose-version';
import { Select } from "bits-ui";
import { generateTestId } from "../helpers/select";
import * as $ from 'svelte/internal/client';

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
	'withOpenCheck'
]);

var root = $.from_html(`<span>x</span>`);
var root_1 = $.from_html(`<!> `, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div><div><!></div></div>`);
var root_4 = $.from_html(`<main data-testid="main"><!> <div data-testid="outside" style="bottom: 0px; right: 10px; position: absolute;">outside</div> <button data-testid="open-binding"> </button> <button data-testid="value-binding"><!></button></main> <div data-testid="portal-target" id="portal-target"></div>`, 1);

export default function Select_force_mount_test($$anchor, $$props) {
	$.push($$props, true);

	const Content = ($$anchor, $$arg0) => {
		let props = () => ($$arg0?.()).props;
		let wrapperProps = () => ($$arg0?.()).wrapperProps;
		var div = root_3();

		$.attribute_effect(div, () => ({ ...wrapperProps() }));

		var div_1 = $.child(div);

		$.attribute_effect(div_1, () => ({ ...props() }));

		var node = $.child(div_1);

		$.component(node, () => Select.Group, ($$anchor, Select_Group) => {
			Select_Group($$anchor, {
				'data-testid': 'group',
				children: ($$anchor, $$slotProps) => {
					var fragment = root_2();
					var node_1 = $.first_child(fragment);

					$.component(node_1, () => Select.GroupHeading, ($$anchor, Select_GroupHeading) => {
						Select_GroupHeading($$anchor, {
							'data-testid': 'group-label',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Options');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_2 = $.sibling(node_1, 2);

					$.each(node_2, 17, () => $.get(filteredItems), ({ value, label, disabled }) => value, ($$anchor, $$item, $$index, $$array) => {
						let value = () => $.get($$item).value;
						let label = () => $.get($$item).label;
						let disabled = () => $.get($$item).disabled;
						const testId = $.derived(() => generateTestId(value()));
						var fragment_1 = $.comment();
						var node_3 = $.first_child(fragment_1);

						{
							const children = ($$anchor, $$arg0) => {
								let selected = () => ($$arg0?.()).selected;
								let _highlighted = () => ($$arg0?.()).highlighted;
								var fragment_2 = root_1();
								var node_4 = $.first_child(fragment_2);

								{
									var consequent = ($$anchor) => {
										var span = root();

										$.template_effect(() => $.set_attribute(span, 'data-testid', `${$.get(testId) ?? ''}-indicator`));
										$.append($$anchor, span);
									};

									$.if(node_4, ($$render) => {
										if (selected()) $$render(consequent);
									});
								}

								var text_1 = $.sibling(node_4);

								$.template_effect(() => $.set_text(text_1, ` ${label() ?? ''}`));
								$.append($$anchor, fragment_2);
							};

							$.component(node_3, () => Select.Item, ($$anchor, Select_Item) => {
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
									children,
									$$slots: { default: true }
								});
							});
						}

						$.append($$anchor, fragment_1);
					});

					$.append($$anchor, fragment);
				},
				$$slots: { default: true }
			});
		});

		$.reset(div_1);
		$.reset(div);
		$.append($$anchor, div);
	};

	let value = $.prop($$props, 'value', 7, ""),
		open = $.prop($$props, 'open', 7, false),
		searchValue = $.prop($$props, 'searchValue', 3, ""),
		withOpenCheck = $.prop($$props, 'withOpenCheck', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const filteredItems = $.derived(() => searchValue() === ""
		? $$props.items
		: $$props.items.filter((item) => item.label.includes(searchValue().toLowerCase())));

	const selectedLabel = $.derived(() => $.get(filteredItems).find((item) => item.value === value())?.label);
	var fragment_3 = root_4();
	var main = $.first_child(fragment_3);
	var node_5 = $.child(main);

	$.component(node_5, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, $.spread_props(() => restProps, {
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
				var fragment_4 = root_2();
				var node_6 = $.first_child(fragment_4);

				$.component(node_6, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						'data-testid': 'trigger',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_7 = $.first_child(fragment_5);

							{
								var consequent_1 = ($$anchor) => {
									var text_2 = $.text();

									$.template_effect(() => $.set_text(text_2, $.get(selectedLabel)));
									$.append($$anchor, text_2);
								};

								var alternate = ($$anchor) => {
									var text_3 = $.text('Open combobox');

									$.append($$anchor, text_3);
								};

								$.if(node_7, ($$render) => {
									if ($.get(selectedLabel)) $$render(consequent_1); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});

				var node_8 = $.sibling(node_6, 2);

				$.component(node_8, () => Select.Portal, ($$anchor, Select_Portal) => {
					Select_Portal($$anchor, $.spread_props(() => $$props.portalProps, {
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = $.comment();
							var node_9 = $.first_child(fragment_7);

							{
								var consequent_3 = ($$anchor) => {
									var fragment_8 = $.comment();
									var node_10 = $.first_child(fragment_8);

									{
										const child = ($$anchor, props = $.noop) => {
											var fragment_9 = $.comment();
											var node_11 = $.first_child(fragment_9);

											{
												var consequent_2 = ($$anchor) => {
													Content($$anchor, props);
												};

												$.if(node_11, ($$render) => {
													if (props().open) $$render(consequent_2);
												});
											}

											$.append($$anchor, fragment_9);
										};

										$.component(node_10, () => Select.Content, ($$anchor, Select_Content) => {
											Select_Content($$anchor, $.spread_props({ 'data-testid': 'content' }, () => $$props.contentProps, { forceMount: true, child, $$slots: { child: true } }));
										});
									}

									$.append($$anchor, fragment_8);
								};

								var alternate_1 = ($$anchor) => {
									var fragment_11 = $.comment();
									var node_12 = $.first_child(fragment_11);

									{
										const child = ($$anchor, props = $.noop) => {
											Content($$anchor, props);
										};

										$.component(node_12, () => Select.Content, ($$anchor, Select_Content_1) => {
											Select_Content_1($$anchor, $.spread_props({ 'data-testid': 'content' }, () => $$props.contentProps, { forceMount: true, child, $$slots: { child: true } }));
										});
									}

									$.append($$anchor, fragment_11);
								};

								$.if(node_9, ($$render) => {
									if (withOpenCheck()) $$render(consequent_3); else $$render(alternate_1, -1);
								});
							}

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					}));
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		}));
	});

	var button = $.sibling(node_5, 4);
	var text_4 = $.only_child(button, true);
	var button_1 = $.sibling(button, 2);
	var node_13 = $.child(button_1);

	{
		var consequent_4 = ($$anchor) => {
			var text_5 = $.text('empty');

			$.append($$anchor, text_5);
		};

		var alternate_2 = ($$anchor) => {
			var text_6 = $.text();

			$.template_effect(() => $.set_text(text_6, value()));
			$.append($$anchor, text_6);
		};

		$.if(node_13, ($$render) => {
			if (value() === "") $$render(consequent_4); else $$render(alternate_2, -1);
		});
	}

	$.reset(button_1);
	$.reset(main);
	$.next(2);
	$.template_effect(() => $.set_text(text_4, open()));
	$.delegated('click', button, () => open(!open()));
	$.delegated('click', button_1, () => value(""));
	$.append($$anchor, fragment_3);
	$.pop();
}

$.delegate(['click']);