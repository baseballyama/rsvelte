import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);
var root = $.from_html(`<div><!></div>`);

export default function Navigation_menu_viewport($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => cn('bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:zoom-out-90 data-open:zoom-in-90 ring-foreground/10 origin-top-center relative mt-1.5 h-[calc(var(--bits-navigation-menu-viewport-height)+1rem)] w-full overflow-hidden rounded-lg shadow ring-1 duration-100 md:w-[calc(var(--bits-navigation-menu-viewport-width)+1rem)]', $$props.class));

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
		() => $.clsx(cn('absolute start-0 top-full isolate z-50 flex justify-center'))
	]);

	$.append($$anchor, div);
	$.pop();
}