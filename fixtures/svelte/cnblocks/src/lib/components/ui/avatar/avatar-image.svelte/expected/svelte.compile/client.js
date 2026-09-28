import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar as AvatarPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'src',
	'alt',
	'ref'
]);

export default function Avatar_image($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("aspect-square size-full", $$props.class));

		$.component(node, () => AvatarPrimitive.Image, ($$anchor, AvatarPrimitive_Image) => {
			AvatarPrimitive_Image($$anchor, $.spread_props(
				{
					get src() {
						return $$props.src;
					},

					get alt() {
						return $$props.alt;
					},

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
					}
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}