import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
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

export default function Drawer_close($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const child = ($$anchor, $$arg0) => {
			let props = () => ($$arg0?.()).props;

			Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.snippet(node_1, () => $$props.children ?? $.noop);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			}));
		};

		let $0 = $.derived(() => cn($$props.class));

		$.component(node, () => DrawerPrimitive.Close, ($$anchor, DrawerPrimitive_Close) => {
			DrawerPrimitive_Close($$anchor, $.spread_props(
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
					child,
					$$slots: { child: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}