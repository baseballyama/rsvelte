import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Kbd_with_icons($$anchor) {
	Example($$anchor, {
		title: 'With Icons',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Kbd.Group, ($$anchor, Kbd_Group) => {
				Kbd_Group($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Kbd.Root, ($$anchor, Kbd_Root) => {
							Kbd_Root($$anchor, {
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'CircleDashedIcon',
										tabler: 'IconCircleDashed',
										hugeicons: 'DashedLineCircleIcon',
										phosphor: 'CircleDashedIcon',
										remixicon: 'RiLoaderLine'
									});
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Kbd.Root, ($$anchor, Kbd_Root_1) => {
							Kbd_Root_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'ArrowLeftIcon',
										tabler: 'IconArrowLeft',
										hugeicons: 'ArrowLeft01Icon',
										phosphor: 'ArrowLeftIcon',
										remixicon: 'RiArrowLeftLine'
									});
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Kbd.Root, ($$anchor, Kbd_Root_2) => {
							Kbd_Root_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'ArrowRightIcon',
										tabler: 'IconArrowRight',
										hugeicons: 'ArrowRight01Icon',
										phosphor: 'ArrowRightIcon',
										remixicon: 'RiArrowRightLine'
									});
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