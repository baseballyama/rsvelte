import 'svelte/internal/disclose-version';
import { ContextMenu } from "bits-ui";
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'checked',
	'subChecked',
	'radio',
	'subRadio',
	'open',
	'contentProps',
	'portalProps',
	'withOpenCheck'
]);

var root = $.from_html(`<span>item</span>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<span>subtrigger</span>`);
var root_3 = $.from_html(`<span>Email</span>`);
var root_4 = $.from_html(`<span data-testid="sub-checkbox-indicator"> </span> sub checkbox`, 1);
var root_5 = $.from_html(`<span data-testid="checkbox-indicator"> </span> Checkbox Item`, 1);
var root_6 = $.from_html(`<span data-testid="radio-indicator-1"> </span> <span>Radio Item 1</span>`, 1);
var root_7 = $.from_html(`<span data-testid="radio-indicator-2"> </span> <span>Radio Item 2</span>`, 1);
var root_8 = $.from_html(`<div><div><!> <!> <!> <!> <!> <!> <!> <!></div></div>`);
var root_9 = $.from_html(`<main><button data-testid="previous-button">previous button</button> <div data-testid="non-portal-container"><!></div> <button data-testid="next-button">next button</button> <button data-testid="binding"> </button> <button data-testid="checked-binding"> </button> <button data-testid="sub-checked-binding"> </button> <button aria-label="radio-main" data-testid="radio-binding"> </button> <button aria-label="radio-sub" data-testid="sub-radio-binding"> </button> <div id="portal-target" data-testid="portal-target"></div> <div data-testid="outside" style="bottom: 0px; right: 10px; position: absolute;">outside</div></main>`);

export default function Context_menu_force_mount_test($$anchor, $$props) {
	const Content = ($$anchor, $$arg0) => {
		let props = () => ($$arg0?.()).props;
		let wrapperProps = () => ($$arg0?.()).wrapperProps;
		var div = root_8();

		$.attribute_effect(div, () => ({ ...wrapperProps() }));

		var div_1 = $.child(div);

		$.attribute_effect(div_1, () => ({ ...props() }));

		var node = $.child(div_1);

		$.component(node, () => ContextMenu.Separator, ($$anchor, ContextMenu_Separator) => {
			ContextMenu_Separator($$anchor, { 'data-testid': 'separator' });
		});

		var node_1 = $.sibling(node, 2);

		$.component(node_1, () => ContextMenu.Group, ($$anchor, ContextMenu_Group) => {
			ContextMenu_Group($$anchor, {
				'data-testid': 'group',
				children: ($$anchor, $$slotProps) => {
					var fragment = root_1();
					var node_2 = $.first_child(fragment);

					$.component(node_2, () => ContextMenu.GroupHeading, ($$anchor, ContextMenu_GroupHeading) => {
						ContextMenu_GroupHeading($$anchor, {
							'data-testid': 'group-heading',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Stuff');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_3 = $.sibling(node_2, 2);

					$.component(node_3, () => ContextMenu.Item, ($$anchor, ContextMenu_Item) => {
						ContextMenu_Item($$anchor, {
							'data-testid': 'item',
							children: ($$anchor, $$slotProps) => {
								var span = root();

								$.append($$anchor, span);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment);
				},
				$$slots: { default: true }
			});
		});

		var node_4 = $.sibling(node_1, 2);

		$.component(node_4, () => ContextMenu.Sub, ($$anchor, ContextMenu_Sub) => {
			ContextMenu_Sub($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_1();
					var node_5 = $.first_child(fragment_1);

					$.component(node_5, () => ContextMenu.SubTrigger, ($$anchor, ContextMenu_SubTrigger) => {
						ContextMenu_SubTrigger($$anchor, {
							'data-testid': 'sub-trigger',
							children: ($$anchor, $$slotProps) => {
								var span_1 = root_2();

								$.append($$anchor, span_1);
							},
							$$slots: { default: true }
						});
					});

					var node_6 = $.sibling(node_5, 2);

					$.component(node_6, () => ContextMenu.SubContent, ($$anchor, ContextMenu_SubContent) => {
						ContextMenu_SubContent($$anchor, {
							'data-testid': 'sub-content',
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root_1();
								var node_7 = $.first_child(fragment_2);

								$.component(node_7, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_1) => {
									ContextMenu_Item_1($$anchor, {
										'data-testid': 'sub-item',
										children: ($$anchor, $$slotProps) => {
											var span_2 = root_3();

											$.append($$anchor, span_2);
										},
										$$slots: { default: true }
									});
								});

								var node_8 = $.sibling(node_7, 2);

								{
									const children = ($$anchor, $$arg0) => {
										let checked = () => ($$arg0?.()).checked;
										let _indeterminate = () => ($$arg0?.()).indeterminate;
										var fragment_3 = root_4();
										var span_3 = $.first_child(fragment_3);
										var text_1 = $.only_child(span_3, true);

										$.next();
										$.template_effect(() => $.set_text(text_1, checked()));
										$.append($$anchor, fragment_3);
									};

									$.component(node_8, () => ContextMenu.CheckboxItem, ($$anchor, ContextMenu_CheckboxItem) => {
										ContextMenu_CheckboxItem($$anchor, {
											'data-testid': 'sub-checkbox-item',
											get checked() {
												return subChecked();
											},

											set checked($$value) {
												subChecked($$value);
											},
											children,
											$$slots: { default: true }
										});
									});
								}

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});

		var node_9 = $.sibling(node_4, 2);

		$.component(node_9, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_2) => {
			ContextMenu_Item_2($$anchor, {
				disabled: true,
				'data-testid': 'disabled-item',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('disabled item');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		});

		var node_10 = $.sibling(node_9, 2);

		$.component(node_10, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_3) => {
			ContextMenu_Item_3($$anchor, {
				disabled: true,
				'data-testid': 'disabled-item-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('disabled item 2');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});
		});

		var node_11 = $.sibling(node_10, 2);

		{
			const children = ($$anchor, $$arg0) => {
				let checked = () => ($$arg0?.()).checked;
				let _indeterminate = () => ($$arg0?.()).indeterminate;
				var fragment_4 = root_5();
				var span_4 = $.first_child(fragment_4);
				var text_4 = $.only_child(span_4, true);

				$.next();
				$.template_effect(() => $.set_text(text_4, checked()));
				$.append($$anchor, fragment_4);
			};

			$.component(node_11, () => ContextMenu.CheckboxItem, ($$anchor, ContextMenu_CheckboxItem_1) => {
				ContextMenu_CheckboxItem_1($$anchor, {
					'data-testid': 'checkbox-item',
					get checked() {
						return checked();
					},

					set checked($$value) {
						checked($$value);
					},
					children,
					$$slots: { default: true }
				});
			});
		}

		var node_12 = $.sibling(node_11, 2);

		$.component(node_12, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_4) => {
			ContextMenu_Item_4($$anchor, {
				'data-testid': 'item-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('item 2');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});
		});

		var node_13 = $.sibling(node_12, 2);

		$.component(node_13, () => ContextMenu.RadioGroup, ($$anchor, ContextMenu_RadioGroup) => {
			ContextMenu_RadioGroup($$anchor, {
				'data-testid': 'radio-group',
				get value() {
					return radio();
				},

				set value($$value) {
					radio($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_1();
					var node_14 = $.first_child(fragment_5);

					{
						const children = ($$anchor, $$arg0) => {
							let checked = () => ($$arg0?.()).checked;
							var fragment_6 = root_6();
							var span_5 = $.first_child(fragment_6);
							var text_6 = $.only_child(span_5, true);

							$.next(2);
							$.template_effect(() => $.set_text(text_6, checked()));
							$.append($$anchor, fragment_6);
						};

						$.component(node_14, () => ContextMenu.RadioItem, ($$anchor, ContextMenu_RadioItem) => {
							ContextMenu_RadioItem($$anchor, {
								value: '1',
								'data-testid': 'radio-item',
								children,
								$$slots: { default: true }
							});
						});
					}

					var node_15 = $.sibling(node_14, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let checked = () => ($$arg0?.()).checked;
							var fragment_7 = root_7();
							var span_6 = $.first_child(fragment_7);
							var text_7 = $.only_child(span_6, true);

							$.next(2);
							$.template_effect(() => $.set_text(text_7, checked()));
							$.append($$anchor, fragment_7);
						};

						$.component(node_15, () => ContextMenu.RadioItem, ($$anchor, ContextMenu_RadioItem_1) => {
							ContextMenu_RadioItem_1($$anchor, {
								value: '2',
								'data-testid': 'radio-item-2',
								children,
								$$slots: { default: true }
							});
						});
					}

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});
		});

		$.reset(div_1);
		$.reset(div);
		$.append($$anchor, div);
	};

	let checked = $.prop($$props, 'checked', 7, false),
		subChecked = $.prop($$props, 'subChecked', 7, false),
		radio = $.prop($$props, 'radio', 7, ""),
		subRadio = $.prop($$props, 'subRadio', 7, ""),
		open = $.prop($$props, 'open', 7, false),
		contentProps = $.prop($$props, 'contentProps', 19, () => ({})),
		portalProps = $.prop($$props, 'portalProps', 19, () => ({})),
		withOpenCheck = $.prop($$props, 'withOpenCheck', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root_9();
	var div_2 = $.sibling($.child(main), 2);
	var node_16 = $.child(div_2);

	$.component(node_16, () => ContextMenu.Root, ($$anchor, ContextMenu_Root) => {
		ContextMenu_Root($$anchor, $.spread_props(() => restProps, {
			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_8 = root_1();
				var node_17 = $.first_child(fragment_8);

				$.component(node_17, () => ContextMenu.Trigger, ($$anchor, ContextMenu_Trigger) => {
					ContextMenu_Trigger($$anchor, {
						'data-testid': 'trigger',
						class: 'h-[500px] w-[500px]',
						'aria-expanded': undefined,
						'aria-controls': undefined,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('open');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});
				});

				var node_18 = $.sibling(node_17, 2);

				$.component(node_18, () => ContextMenu.Portal, ($$anchor, ContextMenu_Portal) => {
					ContextMenu_Portal($$anchor, $.spread_props(portalProps, {
						children: ($$anchor, $$slotProps) => {
							var fragment_9 = $.comment();
							var node_19 = $.first_child(fragment_9);

							{
								var consequent_1 = ($$anchor) => {
									var fragment_10 = $.comment();
									var node_20 = $.first_child(fragment_10);

									{
										const child = ($$anchor, props = $.noop) => {
											var fragment_11 = $.comment();
											var node_21 = $.first_child(fragment_11);

											{
												var consequent = ($$anchor) => {
													Content($$anchor, props);
												};

												$.if(node_21, ($$render) => {
													if (props().open) $$render(consequent);
												});
											}

											$.append($$anchor, fragment_11);
										};

										$.component(node_20, () => ContextMenu.Content, ($$anchor, ContextMenu_Content) => {
											ContextMenu_Content($$anchor, $.spread_props(contentProps, {
												'data-testid': 'content',
												forceMount: true,
												child,
												$$slots: { child: true }
											}));
										});
									}

									$.append($$anchor, fragment_10);
								};

								var alternate = ($$anchor) => {
									var fragment_13 = $.comment();
									var node_22 = $.first_child(fragment_13);

									{
										const child = ($$anchor, props = $.noop) => {
											Content($$anchor, props);
										};

										$.component(node_22, () => ContextMenu.Content, ($$anchor, ContextMenu_Content_1) => {
											ContextMenu_Content_1($$anchor, $.spread_props(contentProps, {
												'data-testid': 'content',
												forceMount: true,
												child,
												$$slots: { child: true }
											}));
										});
									}

									$.append($$anchor, fragment_13);
								};

								$.if(node_19, ($$render) => {
									if (withOpenCheck()) $$render(consequent_1); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_9);
						},
						$$slots: { default: true }
					}));
				});

				$.append($$anchor, fragment_8);
			},
			$$slots: { default: true }
		}));
	});

	$.reset(div_2);

	var button = $.sibling(div_2, 4);
	var text_9 = $.only_child(button, true);
	var button_1 = $.sibling(button, 2);
	var text_10 = $.only_child(button_1, true);
	var button_2 = $.sibling(button_1, 2);
	var text_11 = $.only_child(button_2, true);
	var button_3 = $.sibling(button_2, 2);
	var text_12 = $.only_child(button_3, true);
	var button_4 = $.sibling(button_3, 2);
	var text_13 = $.only_child(button_4, true);

	$.next(4);
	$.reset(main);

	$.template_effect(() => {
		$.set_text(text_9, open());
		$.set_text(text_10, checked());
		$.set_text(text_11, subChecked());
		$.set_text(text_12, radio());
		$.set_text(text_13, subRadio());
	});

	$.delegated('click', button, () => open(!open()));
	$.delegated('click', button_1, () => checked(!checked()));
	$.delegated('click', button_2, () => subChecked(!subChecked()));
	$.delegated('click', button_3, () => radio(""));
	$.delegated('click', button_4, () => subRadio(""));
	$.append($$anchor, main);
}

$.delegate(['click']);