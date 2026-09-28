import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> Left`, 1);
var root_1 = $.from_html(`<!> Voice Enabled`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Kbd_with_icons_and_text($$anchor) {
	Example($$anchor, {
		title: 'With Icons and Text',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Kbd.Group, ($$anchor, Kbd_Group) => {
				Kbd_Group($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Kbd.Root, ($$anchor, Kbd_Root) => {
							Kbd_Root($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									IconPlaceholder(node_2, {
										lucide: 'ArrowLeftIcon',
										tabler: 'IconArrowLeft',
										hugeicons: 'ArrowLeft01Icon',
										phosphor: 'ArrowLeftIcon',
										remixicon: 'RiArrowLeftLine'
									});

									$.next();
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_1, 2);

						$.component(node_3, () => Kbd.Root, ($$anchor, Kbd_Root_1) => {
							Kbd_Root_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_1();
									var node_4 = $.first_child(fragment_4);

									IconPlaceholder(node_4, {
										lucide: 'CircleDashedIcon',
										tabler: 'IconCircleDashed',
										hugeicons: 'DashedLineCircleIcon',
										phosphor: 'CircleDashedIcon',
										remixicon: 'RiLoaderLine'
									});

									$.next();
									$.append($$anchor, fragment_4);
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