import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <span class="sr-only">Info</span>`, 1);
var root_1 = $.from_html(`<p>Additional information</p>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Tooltip_with_icon($$anchor) {
	Example($$anchor, {
		title: 'With Icon',
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

								Button($$anchor, $.spread_props({ variant: 'ghost', size: 'icon' }, props, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_2 = $.first_child(fragment_4);

										IconPlaceholder(node_2, {
											lucide: 'InfoIcon',
											tabler: 'IconInfoCircle',
											hugeicons: 'AlertCircleIcon',
											phosphor: 'InfoIcon',
											remixicon: 'RiInformationLine'
										});

										$.next(2);
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								}));
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