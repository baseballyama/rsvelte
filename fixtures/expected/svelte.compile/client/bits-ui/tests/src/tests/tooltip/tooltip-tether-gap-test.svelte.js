import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip } from "bits-ui";

var root = $.from_html(`<span data-testid="payload"> </span>`);
var root_1 = $.from_html(`<div data-testid="automation-card" style="display: flex; align-items: center; gap: 16px;"><!> <!></div> <!>`, 1);
var root_2 = $.from_html(`<main data-testid="main" style="position: relative; width: 360px; height: 240px; padding: 24px;"><!> <div data-testid="open-binding"> </div> <div data-testid="outside" style="margin-top: 120px;">outside</div></main>`);

export default function Tooltip_tether_gap_test($$anchor, $$props) {
	$.push($$props, true);

	const tether = Tooltip.createTether();
	let open = $.state(false);
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
						id: 'trigger-left',
						'data-testid': 'trigger-left',
						get tether() {
							return tether;
						},
						payload: { label: "Left" },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Left');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_1) => {
					Tooltip_Trigger_1($$anchor, {
						id: 'trigger-right',
						'data-testid': 'trigger-right',
						get tether() {
							return tether;
						},
						payload: { label: "Right" },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Right');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div);

				var node_3 = $.sibling(div, 2);

				{
					const children = ($$anchor, $$arg0) => {
						let payload = () => ($$arg0?.()).payload;
						var fragment_1 = $.comment();
						var node_4 = $.first_child(fragment_1);

						$.component(node_4, () => Tooltip.Portal, ($$anchor, Tooltip_Portal) => {
							Tooltip_Portal($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = $.comment();
									var node_5 = $.first_child(fragment_2);

									$.component(node_5, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
										Tooltip_Content($$anchor, {
											'data-testid': 'content',
											side: 'top',
											sideOffset: 10,
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

					$.component(node_3, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
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

	var div_1 = $.sibling(node, 2);
	var text_3 = $.only_child(div_1, true);

	$.next(2);
	$.reset(main);
	$.template_effect(() => $.set_text(text_3, $.get(open) ? "true" : "false"));
	$.append($$anchor, main);
	$.pop();
}