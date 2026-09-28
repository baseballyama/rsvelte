import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils';
import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'ref']);
var root = $.from_html(`<div><!></div>`);

export default function Navigation_menu_viewport($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => cn('origin-top-center bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-(--bits-navigation-menu-viewport-height) w-full overflow-hidden rounded-md border shadow-sm md:w-(--bits-navigation-menu-viewport-width)', $$props.class));

		$.component(node, () => NavigationMenuPrimitive.Viewport, ($$anchor, NavigationMenuPrimitive_Viewport) => {
			NavigationMenuPrimitive_Viewport($$anchor, $.spread_props(
				{
					'data-slot': 'navigation-menu-viewport',
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

	$.reset(div);

	$.template_effect(($0) => $.set_class(div, 1, $0), [
		() => $.clsx(cn('absolute top-full left-0 isolate z-50 flex justify-center'))
	]);

	$.append($$anchor, div);
	$.pop();
}