import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip } from "bits-ui";
import MagicWand from "phosphor-svelte/lib/MagicWand";
import { fly } from "svelte/transition";

var root = $.from_html(`<div><div><div class="rounded-input border-dark-10 bg-background shadow-popover outline-hidden z-0 flex items-center justify-center border p-3 text-sm font-medium">Make some magic!</div></div></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Tooltip_demo_transition($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						delayDuration: 200,
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
								Tooltip_Trigger($$anchor, {
									class: 'border-border-input bg-background-alt shadow-btn ring-dark ring-offset-background\n		hover:bg-muted focus-visible:ring-dark focus-visible:ring-offset-background focus-visible:outline-hidden inline-flex size-10 items-center justify-center rounded-full border focus-visible:ring-2 focus-visible:ring-offset-2',
									children: ($$anchor, $$slotProps) => {
										MagicWand($$anchor, { class: 'size-5' });
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							{
								const child = ($$anchor, $$arg0) => {
									let wrapperProps = () => ($$arg0?.()).wrapperProps;
									let props = () => ($$arg0?.()).props;
									let open = () => ($$arg0?.()).open;
									var fragment_4 = $.comment();
									var node_4 = $.first_child(fragment_4);

									{
										var consequent = ($$anchor) => {
											var div = root();

											$.attribute_effect(div, () => ({ ...wrapperProps() }));

											var div_1 = $.child(div);

											$.attribute_effect(div_1, () => ({ ...props() }));
											$.reset(div);
											$.transition(3, div_1, () => fly, () => ({ duration: 300 }));
											$.append($$anchor, div);
										};

										$.if(node_4, ($$render) => {
											if (open()) $$render(consequent);
										});
									}

									$.append($$anchor, fragment_4);
								};

								$.component(node_3, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
									Tooltip_Content($$anchor, {
										sideOffset: 8,
										forceMount: true,
										child,
										$$slots: { child: true }
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

	$.append($$anchor, fragment);
}