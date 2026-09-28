import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'children',
	'child',
	'class',
	'size',
	'isActive'
]);

var root = $.from_html(`<a><!></a>`);

export default function Sidebar_menu_sub_button($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		size = $.prop($$props, 'size', 3, "md"),
		isActive = $.prop($$props, 'isActive', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const mergedProps = $.derived(() => ({
		class: cn("flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground ring-sidebar-ring outline-hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground", "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground", size() === "sm" && "text-xs", size() === "md" && "text-sm", "group-data-[collapsible=icon]:hidden", $$props.class),
		"data-slot": "sidebar-menu-sub-button",
		"data-sidebar": "menu-sub-button",
		"data-size": size(),
		"data-active": isActive(),
		...restProps
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.child, () => ({ props: $.get(mergedProps) }));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var a = root();

			$.attribute_effect(a, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(a);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(a);
			$.bind_this(a, ($$value) => ref($$value), () => ref());
			$.append($$anchor, a);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}