import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as HoverCard from "$lib/registry/ui/hover-card/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex flex-col style-vega:gap-2 style-nova:gap-1.5 style-lyra:gap-1 style-maia:gap-2 style-mira:gap-1"><h4 class="font-medium">Hover Card</h4> <p> </p></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-wrap items-center justify-center gap-4"></div>`);

export default function Hover_card_sides($$anchor) {
	const HOVER_CARD_SIDES = ["top", "right", "bottom", "left"];

	Example($$anchor, {
		title: 'Sides',
		children: ($$anchor, $$slotProps) => {
			var div = root_2();

			$.each(div, 20, () => HOVER_CARD_SIDES, (side) => side, ($$anchor, side) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.component(node, () => HoverCard.Root, ($$anchor, HoverCard_Root) => {
					HoverCard_Root($$anchor, {
						openDelay: 100,
						closeDelay: 100,
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_1 = $.first_child(fragment_2);

							{
								const child = ($$anchor, $$arg0) => {
									let props = () => ($$arg0?.()).props;

									Button($$anchor, $.spread_props({ variant: 'outline', class: 'capitalize' }, props, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(() => $.set_text(text, side));
											$.append($$anchor, text);
										},
										$$slots: { default: true }
									}));
								};

								$.component(node_1, () => HoverCard.Trigger, ($$anchor, HoverCard_Trigger) => {
									HoverCard_Trigger($$anchor, { child, $$slots: { child: true } });
								});
							}

							var node_2 = $.sibling(node_1, 2);

							$.component(node_2, () => HoverCard.Content, ($$anchor, HoverCard_Content) => {
								HoverCard_Content($$anchor, {
									get side() {
										return side;
									},

									children: ($$anchor, $$slotProps) => {
										var div_1 = root();
										var p = $.sibling($.child(div_1), 2);
										var text_1 = $.only_child(p);

										$.reset(div_1);
										$.template_effect(() => $.set_text(text_1, `This hover card appears on the ${side ?? ''} side of the trigger.`));
										$.append($$anchor, div_1);
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
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}