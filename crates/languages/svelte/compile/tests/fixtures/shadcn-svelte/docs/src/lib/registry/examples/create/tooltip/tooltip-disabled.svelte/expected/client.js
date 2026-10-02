import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<span><!></span>`);
var root_1 = $.from_html(`<p>This feature is currently unavailable</p>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Tooltip_disabled($$anchor) {
	Example($$anchor, {
		title: 'Disabled',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
				Tooltip_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;
								var span = root();

								$.attribute_effect(span, () => ({ class: 'inline-block w-fit', ...props() }));

								var node_2 = $.child(span);

								Button(node_2, {
									variant: 'outline',
									disabled: true,
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Disabled');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});

								$.reset(span);
								$.append($$anchor, span);
							};

							$.component(node_1, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
								Tooltip_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_3 = $.sibling(node_1, 2);

						$.component(node_3, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
							Tooltip_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var p = root_1();

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
		},
		$$slots: { default: true }
	});
}