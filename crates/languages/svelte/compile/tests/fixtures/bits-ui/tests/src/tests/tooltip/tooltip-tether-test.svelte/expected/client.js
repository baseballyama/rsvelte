import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip } from "bits-ui";

var root = $.from_html(`<span data-testid="payload"> </span>`);
var root_1 = $.from_html(`<div data-testid="detached-top"><!></div> <!> <div data-testid="detached-bottom"><!> <!></div>`, 1);
var root_2 = $.from_html(`<main data-testid="main"><!> <button data-testid="tether-open-top">Open top</button> <button data-testid="tether-open-bottom">Open bottom</button> <button data-testid="tether-close">Close tether</button> <div data-testid="open-binding"> </div> <div data-testid="trigger-binding"> </div> <div data-testid="outside">outside</div></main>`);

export default function Tooltip_tether_test($$anchor, $$props) {
	$.push($$props, true);

	const tether = Tooltip.createTether();
	let open = $.state(false);
	let triggerId = $.state(null);
	var main = root_2();
	var node = $.child(main);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			delayDuration: 0,
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var div = $.first_child(fragment);
				var node_1 = $.child(div);

				$.component(node_1, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
					Tooltip_Trigger($$anchor, {
						id: 'trigger-top',
						'data-testid': 'trigger-top',
						get tether() {
							return tether;
						},
						payload: { label: "Top" },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Top');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div);

				var node_2 = $.sibling(div, 2);

				{
					const children = ($$anchor, $$arg0) => {
						let payload = () => ($$arg0?.()).payload;
						var fragment_1 = $.comment();
						var node_3 = $.first_child(fragment_1);

						$.component(node_3, () => Tooltip.Portal, ($$anchor, Tooltip_Portal) => {
							Tooltip_Portal($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = $.comment();
									var node_4 = $.first_child(fragment_2);

									$.component(node_4, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
										Tooltip_Content($$anchor, {
											'data-testid': 'content',
											sideOffset: 10,
											children: ($$anchor, $$slotProps) => {
												var span = root();
												var text_1 = $.only_child(span, true);

												$.template_effect(() => $.set_text(text_1, payload()?.label ?? "null"));
												$.append($$anchor, span);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					};

					$.component(node_2, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
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

				var div_1 = $.sibling(node_2, 2);
				var node_5 = $.child(div_1);

				$.component(node_5, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_1) => {
					Tooltip_Trigger_1($$anchor, {
						id: 'trigger-bottom',
						'data-testid': 'trigger-bottom',
						get tether() {
							return tether;
						},
						payload: { label: "Bottom" },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Bottom');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				var node_6 = $.sibling(node_5, 2);

				$.component(node_6, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_2) => {
					Tooltip_Trigger_2($$anchor, {
						id: 'trigger-disabled',
						'data-testid': 'trigger-disabled',
						get tether() {
							return tether;
						},
						disabled: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Disabled');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_1);
				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var button = $.sibling(node, 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var div_2 = $.sibling(button_2, 2);
	var text_4 = $.only_child(div_2, true);
	var div_3 = $.sibling(div_2, 2);
	var text_5 = $.only_child(div_3, true);

	$.next(2);
	$.reset(main);

	$.template_effect(() => {
		$.set_text(text_4, $.get(open) ? "true" : "false");
		$.set_text(text_5, $.get(triggerId) ?? "null");
	});

	$.delegated('click', button, () => tether.open("trigger-top"));
	$.delegated('click', button_1, () => tether.open("trigger-bottom"));
	$.delegated('click', button_2, () => tether.close());
	$.append($$anchor, main);
	$.pop();
}

$.delegate(['click']);