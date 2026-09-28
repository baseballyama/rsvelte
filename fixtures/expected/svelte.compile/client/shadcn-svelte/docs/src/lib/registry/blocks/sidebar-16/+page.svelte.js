import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import AppSidebar from "./components/app-sidebar.svelte";
import SiteHeader from "./components/site-header.svelte";

var root = $.from_html(`<div class="flex flex-1 flex-col gap-4 p-4"><div class="grid auto-rows-min gap-4 md:grid-cols-3"><div class="aspect-video rounded-xl bg-muted/50"></div> <div class="aspect-video rounded-xl bg-muted/50"></div> <div class="aspect-video rounded-xl bg-muted/50"></div></div> <div class="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min"></div></div>`);
var root_1 = $.from_html(`<!> <div class="flex flex-1"><!> <!></div>`, 1);
var root_2 = $.from_html(`<div class="[--header-height:calc(--spacing(14))]"><!></div>`);

export default function _page($$anchor) {
	var div = root_2();
	var node = $.child(div);

	$.component(node, () => Sidebar.Provider, ($$anchor, Sidebar_Provider) => {
		Sidebar_Provider($$anchor, {
			class: 'flex flex-col',
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				SiteHeader(node_1, {});

				var div_1 = $.sibling(node_1, 2);
				var node_2 = $.child(div_1);

				AppSidebar(node_2, {});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => Sidebar.Inset, ($$anchor, Sidebar_Inset) => {
					Sidebar_Inset($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var div_2 = root();

							$.append($$anchor, div_2);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_1);
				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}