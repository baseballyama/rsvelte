import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip } from "bits-ui";

var root = $.from_html(`<span data-testid="payload"> </span>`);
var root_1 = $.from_html(`<div data-testid="trigger-group"><!> <!> <!></div> <!>`, 1);
var root_2 = $.from_html(`<main data-testid="main"><!> <button data-testid="toggle-trigger-one">Toggle trigger 1</button> <button data-testid="toggle-trigger-two-disabled">Toggle trigger 2 disabled</button> <button data-testid="toggle-custom-anchor">Toggle custom anchor</button> <div data-testid="open-binding"> </div> <div data-testid="trigger-binding"> </div> <div data-testid="custom-anchor" style="margin-top: 20px; margin-left: 220px; width: 20px; height: 20px;">anchor</div> <div data-testid="outside">outside</div></main>`);

export default function Tooltip_singleton_edge_test($$anchor, $$props) {
	$.push($$props, true);

	const tether = Tooltip.createTether();
	let open = $.state(false);
	let triggerId = $.state(null);
	let showTriggerOne = $.state(true);
	let disableTriggerTwo = $.state(false);
	let useCustomAnchor = $.state(false);
	let customAnchor = $.state(null);
	var main = root_2();
	var node = $.child(main);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			delayDuration: 0,
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				{
					const children = ($$anchor, $$arg0) => {
						let payload = () => ($$arg0?.()).payload;
						var fragment_1 = root_1();
						var div = $.first_child(fragment_1);
						var node_2 = $.child(div);

						{
							var consequent = ($$anchor) => {
								var fragment_2 = $.comment();
								var node_3 = $.first_child(fragment_2);

								$.component(node_3, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
									Tooltip_Trigger($$anchor, {
										id: 'trigger-1',
										'data-testid': 'trigger-1',
										get tether() {
											return tether;
										},
										payload: { label: "First" },
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('First');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							};

							$.if(node_2, ($$render) => {
								if ($.get(showTriggerOne)) $$render(consequent);
							});
						}

						var node_4 = $.sibling(node_2, 2);

						$.component(node_4, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_1) => {
							Tooltip_Trigger_1($$anchor, {
								id: 'trigger-2',
								'data-testid': 'trigger-2',
								get tether() {
									return tether;
								},

								get disabled() {
									return $.get(disableTriggerTwo);
								},
								payload: { label: "Second" },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Second');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						var node_5 = $.sibling(node_4, 2);

						$.component(node_5, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_2) => {
							Tooltip_Trigger_2($$anchor, {
								id: 'trigger-disabled',
								'data-testid': 'trigger-disabled',
								get tether() {
									return tether;
								},
								disabled: true,
								payload: { label: "Disabled" },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Disabled');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div);

						var node_6 = $.sibling(div, 2);

						$.component(node_6, () => Tooltip.Portal, ($$anchor, Tooltip_Portal) => {
							Tooltip_Portal($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_7 = $.first_child(fragment_3);

									{
										let $0 = $.derived(() => $.get(useCustomAnchor) ? $.get(customAnchor) : undefined);

										$.component(node_7, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
											Tooltip_Content($$anchor, {
												'data-testid': 'content',
												get customAnchor() {
													return $.get($0);
												},

												children: ($$anchor, $$slotProps) => {
													var span = root();
													var text_3 = $.only_child(span, true);

													$.template_effect(() => $.set_text(text_3, payload()?.label ?? "null"));
													$.append($$anchor, span);
												},
												$$slots: { default: true }
											});
										});
									}

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					};

					$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
						Tooltip_Root($$anchor, {
							get tether() {
								return tether;
							},

							get open() {
								return $.get(open);
							},

							set open($$value) {
								$.set(open, $$value, true);
							},

							get triggerId() {
								return $.get(triggerId);
							},

							set triggerId($$value) {
								$.set(triggerId, $$value, true);
							},
							children,
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var button = $.sibling(node, 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var div_1 = $.sibling(button_2, 2);
	var text_4 = $.only_child(div_1, true);
	var div_2 = $.sibling(div_1, 2);
	var text_5 = $.only_child(div_2, true);
	var div_3 = $.sibling(div_2, 2);

	$.bind_this(div_3, ($$value) => $.set(customAnchor, $$value), () => $.get(customAnchor));
	$.next(2);
	$.reset(main);

	$.template_effect(() => {
		$.set_text(text_4, $.get(open) ? "true" : "false");
		$.set_text(text_5, $.get(triggerId) ?? "null");
	});

	$.delegated('click', button, () => $.set(showTriggerOne, !$.get(showTriggerOne)));
	$.delegated('click', button_1, () => $.set(disableTriggerTwo, !$.get(disableTriggerTwo)));
	$.delegated('click', button_2, () => $.set(useCustomAnchor, !$.get(useCustomAnchor)));
	$.append($$anchor, main);
	$.pop();
}

$.delegate(['click']);