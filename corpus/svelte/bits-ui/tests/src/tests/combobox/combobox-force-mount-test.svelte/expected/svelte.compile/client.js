import 'svelte/internal/disclose-version';
import { Combobox } from "bits-ui";
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
	'inputProps',
	'onOpenChange',
	'withOpenCheck'
]);

var root = $.from_html(`<span>x</span>`);
var root_1 = $.from_html(`<!> `, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div><div><!></div></div>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<main data-testid="main" class="flex flex-col gap-12"><!> <div data-testid="outside" style="bottom: 0px; right: 10px; position: absolute;">outside</div> <button data-testid="input-binding"><!></button> <button data-testid="open-binding"> </button> <button data-testid="value-binding"><!></button></main> <div data-testid="portal-target" id="portal-target"></div>`, 1);

export default function Combobox_force_mount_test($$anchor, $$props) {
	$.push($$props, true);

	const Content = ($$anchor, $$arg0) => {
		let props = () => ($$arg0?.()).props;
		let wrapperProps = () => ($$arg0?.()).wrapperProps;
		var div = root_3();

		$.attribute_effect(div, () => ({ ...wrapperProps() }));

		var div_1 = $.child(div);

		$.attribute_effect(div_1, () => ({ ...props() }));

		var node = $.child(div_1);

		$.component(node, () => Combobox.Group, ($$anchor, Combobox_Group) => {
			Combobox_Group($$anchor, {
				'data-testid': 'group',
				children: ($$anchor, $$slotProps) => {
					var fragment = root_2();
					var node_1 = $.first_child(fragment);

					$.component(node_1, () => Combobox.GroupHeading, ($$anchor, Combobox_GroupHeading) => {
						Combobox_GroupHeading($$anchor, {
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

										$.template_effect(() => $.set_attribute(span, 'data-testid', `${value() ?? ''}-indicator`));
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

							$.component(node_3, () => Combobox.Item, ($$anchor, Combobox_Item) => {
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
		searchValue = $.prop($$props, 'searchValue', 7, ""),
		withOpenCheck = $.prop($$props, 'withOpenCheck', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const filteredItems = $.derived(() => searchValue() === ""
		? $$props.items
		: $$props.items.filter((item) => item.label.includes(searchValue().toLowerCase())));

	var fragment_3 = root_5();
	var main = $.first_child(fragment_3);
	var node_5 = $.child(main);

	$.component(node_5, () => Combobox.Root, ($$anchor, Combobox_Root) => {
		Combobox_Root($$anchor, $.spread_props({ type: 'single' }, () => restProps, {
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
				var fragment_4 = root_4();
				var node_6 = $.first_child(fragment_4);

				$.component(node_6, () => Combobox.Trigger, ($$anchor, Combobox_Trigger) => {
					Combobox_Trigger($$anchor, {
						'data-testid': 'trigger',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Open combobox');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				var node_7 = $.sibling(node_6, 2);

				$.component(node_7, () => Combobox.Input, ($$anchor, Combobox_Input) => {
					Combobox_Input($$anchor, $.spread_props(
						{
							'data-testid': 'input',
							'aria-label': 'open combobox',
							oninput: (e) => searchValue(e.currentTarget.value)
						},
						() => $$props.inputProps
					));
				});

				var node_8 = $.sibling(node_7, 2);

				$.component(node_8, () => Combobox.Portal, ($$anchor, Combobox_Portal) => {
					Combobox_Portal($$anchor, $.spread_props(() => $$props.portalProps, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_9 = $.first_child(fragment_5);

							{
								var consequent_2 = ($$anchor) => {
									var fragment_6 = $.comment();
									var node_10 = $.first_child(fragment_6);

									{
										const child = ($$anchor, props = $.noop) => {
											var fragment_7 = $.comment();
											var node_11 = $.first_child(fragment_7);

											{
												var consequent_1 = ($$anchor) => {
													Content($$anchor, props);
												};

												$.if(node_11, ($$render) => {
													if (props().open) $$render(consequent_1);
												});
											}

											$.append($$anchor, fragment_7);
										};

										$.component(node_10, () => Combobox.Content, ($$anchor, Combobox_Content) => {
											Combobox_Content($$anchor, $.spread_props({ 'data-testid': 'content' }, () => $$props.contentProps, { forceMount: true, child, $$slots: { child: true } }));
										});
									}

									$.append($$anchor, fragment_6);
								};

								var alternate = ($$anchor) => {
									var fragment_9 = $.comment();
									var node_12 = $.first_child(fragment_9);

									{
										const child = ($$anchor, props = $.noop) => {
											Content($$anchor, props);
										};

										$.component(node_12, () => Combobox.Content, ($$anchor, Combobox_Content_1) => {
											Combobox_Content_1($$anchor, $.spread_props({ 'data-testid': 'content' }, () => $$props.contentProps, { forceMount: true, child, $$slots: { child: true } }));
										});
									}

									$.append($$anchor, fragment_9);
								};

								$.if(node_9, ($$render) => {
									if (withOpenCheck()) $$render(consequent_2); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_5);
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
	var node_13 = $.child(button);

	{
		var consequent_3 = ($$anchor) => {
			var text_3 = $.text('empty');

			$.append($$anchor, text_3);
		};

		var alternate_1 = ($$anchor) => {
			var text_4 = $.text();

			$.template_effect(() => $.set_text(text_4, searchValue()));
			$.append($$anchor, text_4);
		};

		$.if(node_13, ($$render) => {
			if (searchValue() === "") $$render(consequent_3); else $$render(alternate_1, -1);
		});
	}

	$.reset(button);

	var button_1 = $.sibling(button, 2);
	var text_5 = $.only_child(button_1, true);
	var button_2 = $.sibling(button_1, 2);
	var node_14 = $.child(button_2);

	{
		var consequent_4 = ($$anchor) => {
			var text_6 = $.text('empty');

			$.append($$anchor, text_6);
		};

		var alternate_2 = ($$anchor) => {
			var text_7 = $.text();

			$.template_effect(() => $.set_text(text_7, value()));
			$.append($$anchor, text_7);
		};

		$.if(node_14, ($$render) => {
			if (value() === "") $$render(consequent_4); else $$render(alternate_2, -1);
		});
	}

	$.reset(button_2);
	$.reset(main);
	$.next(2);
	$.template_effect(() => $.set_text(text_5, open()));
	$.delegated('click', button, () => searchValue(""));
	$.delegated('click', button_1, () => open(!open()));
	$.delegated('click', button_2, () => value(""));
	$.append($$anchor, fragment_3);
	$.pop();
}

$.delegate(['click']);