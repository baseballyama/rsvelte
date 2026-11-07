import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<p>Add to library</p>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-wrap gap-2"></div>`);

export default function Tooltip_sides($$anchor) {
	Example($$anchor, {
		title: 'Sides',
		children: ($$anchor, $$slotProps) => {
			var div = root_2();

			$.each(div, 20, () => ["top", "right", "bottom", "left"], (side) => side, ($$anchor, side) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.component(node, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_1 = $.first_child(fragment_2);

							{
								const child = ($$anchor, $$arg0) => {
									let props = () => ($$arg0?.()).props;

									Button($$anchor, $.spread_props({ variant: 'outline', class: 'w-fit capitalize' }, props, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(() => $.set_text(text, side));
											$.append($$anchor, text);
										},
										$$slots: { default: true }
									}));
								};

								$.component(node_1, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
									Tooltip_Trigger($$anchor, { child, $$slots: { child: true } });
								});
							}

							var node_2 = $.sibling(node_1, 2);

							$.component(node_2, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
								Tooltip_Content($$anchor, {
									get side() {
										return side;
									},

									children: ($$anchor, $$slotProps) => {
										var p = root();

										$.append($$anchor, p);
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