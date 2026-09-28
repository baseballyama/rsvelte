import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip } from "bits-ui";

var root = $.from_html(`<span data-testid="payload"> </span>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<main data-testid="main"><!> <button data-testid="open-trigger-1">Open Trigger 1</button> <button data-testid="open-trigger-2">Open Trigger 2</button> <button data-testid="set-null-trigger">Set null trigger</button> <button data-testid="close">Close</button> <div data-testid="open-binding"> </div> <div data-testid="trigger-binding"> </div> <div data-testid="outside">outside</div></main>`);

export default function Tooltip_singleton_controlled_test($$anchor, $$props) {
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
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				{
					const children = ($$anchor, $$arg0) => {
						let payload = () => ($$arg0?.()).payload;
						var fragment_1 = root_1();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
							Tooltip_Trigger($$anchor, {
								id: 'trigger-1',
								'data-testid': 'trigger-1',
								get tether() {
									return tether;
								},
								payload: { label: "One" },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('One');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_1) => {
							Tooltip_Trigger_1($$anchor, {
								id: 'trigger-2',
								'data-testid': 'trigger-2',
								get tether() {
									return tether;
								},
								payload: { label: "Two" },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Two');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => Tooltip.Portal, ($$anchor, Tooltip_Portal) => {
							Tooltip_Portal($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = $.comment();
									var node_5 = $.first_child(fragment_2);

									$.component(node_5, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
										Tooltip_Content($$anchor, {
											'data-testid': 'content',
											children: ($$anchor, $$slotProps) => {
												var span = root();
												var text_2 = $.only_child(span, true);

												$.template_effect(() => $.set_text(text_2, payload()?.label ?? "null"));
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
	var button_3 = $.sibling(button_2, 2);
	var div = $.sibling(button_3, 2);
	var text_3 = $.only_child(div, true);
	var div_1 = $.sibling(div, 2);
	var text_4 = $.only_child(div_1, true);

	$.next(2);
	$.reset(main);

	$.template_effect(() => {
		$.set_text(text_3, $.get(open) ? "true" : "false");
		$.set_text(text_4, $.get(triggerId) ?? "null");
	});

	$.delegated('click', button, () => {
		$.set(triggerId, "trigger-1");
		$.set(open, true);
	});

	$.delegated('click', button_1, () => {
		$.set(triggerId, "trigger-2");
		$.set(open, true);
	});

	$.delegated('click', button_2, () => {
		$.set(triggerId, null);
	});

	$.delegated('click', button_3, () => {
		$.set(open, false);
	});

	$.append($$anchor, main);
	$.pop();
}

$.delegate(['click']);