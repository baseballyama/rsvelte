import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import DocsSidebar from "$lib/components/docs-sidebar.svelte";
import { sidebarNavItems } from "$lib/navigation.js";

var root = $.from_html(`<!> <div class="h-full w-full"><!></div>`, 1);
var root_1 = $.from_html(`<div class="container-wrapper flex flex-1 flex-col px-2"><!></div>`);

export default function _layout($$anchor, $$props) {
	var div = root_1();
	var node = $.child(div);

	$.component(node, () => Sidebar.Provider, ($$anchor, Sidebar_Provider) => {
		Sidebar_Provider($$anchor, {
			class: 'min-h-min flex-1 items-start px-0 [--top-spacing:0] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:[--top-spacing:calc(var(--spacing)*4)] 3xl:fixed:container 3xl:fixed:px-3',
			style: '--sidebar-width: calc(var(--spacing) * 72)',
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				DocsSidebar(node_1, {
					get navItems() {
						return sidebarNavItems;
					}
				});

				var div_1 = $.sibling(node_1, 2);
				var node_2 = $.child(div_1);

				$.snippet(node_2, () => $$props.children);
				$.reset(div_1);
				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}