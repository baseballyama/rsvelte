import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex items-center gap-2">Save Changes <!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Kbd_in_tooltip($$anchor) {
	Example($$anchor, {
		title: 'Tooltip',
		children: ($$anchor, $$slotProps) => {
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

								Button($$anchor, $.spread_props({ size: 'icon-sm', variant: 'outline' }, props, {
									children: ($$anchor, $$slotProps) => {
										IconPlaceholder($$anchor, {
											lucide: 'SaveIcon',
											tabler: 'IconDeviceFloppy',
											hugeicons: 'FloppyDiskIcon',
											phosphor: 'FloppyDiskIcon',
											remixicon: 'RiSaveLine'
										});
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
								class: 'pr-1.5',
								children: ($$anchor, $$slotProps) => {
									var div = root();
									var node_3 = $.sibling($.child(div));

									$.component(node_3, () => Kbd.Root, ($$anchor, Kbd_Root) => {
										Kbd_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('S');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div);
									$.append($$anchor, div);
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