import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Drawer as DrawerPrimitive } from "vaul-svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'shouldScaleBackground',
	'open',
	'activeSnapPoint'
]);

export default function Drawer($$anchor, $$props) {
	$.push($$props, true);

	let shouldScaleBackground = $.prop($$props, 'shouldScaleBackground', 3, true),
		open = $.prop($$props, 'open', 15, false),
		activeSnapPoint = $.prop($$props, 'activeSnapPoint', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DrawerPrimitive.Root, ($$anchor, DrawerPrimitive_Root) => {
		DrawerPrimitive_Root($$anchor, $.spread_props(
			{
				get shouldScaleBackground() {
					return shouldScaleBackground();
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