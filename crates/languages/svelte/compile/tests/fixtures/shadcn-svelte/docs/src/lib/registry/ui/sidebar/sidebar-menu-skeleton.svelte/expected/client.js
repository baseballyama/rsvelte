import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'showIcon',
	'children'
]);

var root = $.from_html(`<div><!> <!> <!></div>`);

export default function Sidebar_menu_skeleton($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		showIcon = $.prop($$props, 'showIcon', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	// Random width between 50% and 90%
	const width = `${Math.floor(Math.random() * 40) + 50}%`;

	var div = root();

	$.attribute_effect(
		div,
		($0) => ({
			'data-slot': 'sidebar-menu-skeleton',
			'data-sidebar': 'menu-skeleton',
			class: $0,
			...restProps
		}),
		[
			() => cn("cn-sidebar-menu-skeleton flex items-center", $$props.class)
		]
	);

	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			Skeleton($$anchor, {
				class: 'cn-sidebar-menu-skeleton-icon',
				'data-sidebar': 'menu-skeleton-icon'
			});
		};

		$.if(node, ($$render) => {
			if (showIcon()) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	Skeleton(node_1, {
		class: 'cn-sidebar-menu-skeleton-text max-w-(--skeleton-width) flex-1',
		'data-sidebar': 'menu-skeleton-text',
		get style() {
			return `--skeleton-width: ${width};`;
		}
	});

	var node_2 = $.sibling(node_1, 2);

	$.snippet(node_2, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div);
	$.pop();
}