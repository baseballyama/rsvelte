import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Drawer as DrawerPrimitive } from 'vaul-svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'activeSnapPoint',
	'open',
	'setBackgroundColorOnScale',
	'shouldScaleBackground'
]);

export default function Drawer($$anchor, $$props) {
	$.push($$props, true);

	let activeSnapPoint = $.prop($$props, 'activeSnapPoint', 15, null),
		open = $.prop($$props, 'open', 15, false),
		setBackgroundColorOnScale = $.prop($$props, 'setBackgroundColorOnScale', 3, false),
		shouldScaleBackground = $.prop($$props, 'shouldScaleBackground', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DrawerPrimitive.Root, ($$anchor, DrawerPrimitive_Root) => {
		DrawerPrimitive_Root($$anchor, $.spread_props(
			{
				get shouldScaleBackground() {
					return shouldScaleBackground();
				},

				get setBackgroundColorOnScale() {
					return setBackgroundColorOnScale();
				}
			},
			() => restProps,
			{
				get open() {
					return open();
				},

				set open($$value) {
					open($$value);
				},

				get activeSnapPoint() {
					return activeSnapPoint();
				},

				set activeSnapPoint($$value) {
					activeSnapPoint($$value);
				}
			}
		));
	});

	$.append($$anchor, fragment);
	$.pop();
}