import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DrawerOverlay from './drawer-overlay.svelte';
import { cn } from '$lib/utils.js';
import { Drawer as DrawerPrimitive } from 'vaul-svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'ref'
]);

var root = $.from_html(`<div class="bg-muted mx-auto mt-4 h-2 w-[100px] rounded-full"></div> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Drawer_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DrawerPrimitive.Portal, ($$anchor, DrawerPrimitive_Portal) => {
		DrawerPrimitive_Portal($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				DrawerOverlay(node_1, {});

				var node_2 = $.sibling(node_1, 2);

				{
					let $0 = $.derived(() => cn('border-border bg-background fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-(--radius) border', $$props.class));

					$.component(node_2, () => DrawerPrimitive.Content, ($$anchor, DrawerPrimitive_Content) => {
						DrawerPrimitive_Content($$anchor, $.spread_props(
							{
								get class() {
									return $.get($0);
								}
							},
							() => restProps,
							{
								get ref() {
									return ref();
								},

								set ref($$value) {
									ref($$value);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root();
									var node_3 = $.sibling($.first_child(fragment_2), 2);

									$.snippet(node_3, () => $$props.children ?? $.noop);
									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							}
						));
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}