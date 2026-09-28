import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import AppSidebar from "./components/app-sidebar.svelte";
import ChartAreaInteractive from "./components/chart-area-interactive.svelte";
import DataTable from "./components/data-table.svelte";
import SectionCards from "./components/section-cards.svelte";
import SiteHeader from "./components/site-header.svelte";
import data from "./data.js";

var root = $.from_html(`<!> <div class="flex flex-1 flex-col"><div class="@container/main flex flex-1 flex-col gap-2"><div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6"><!> <div class="px-4 lg:px-6"><!></div> <!></div></div></div>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Provider, ($$anchor, Sidebar_Provider) => {
		Sidebar_Provider($$anchor, {
			style: '--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				AppSidebar(node_1, { variant: 'inset' });

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Sidebar.Inset, ($$anchor, Sidebar_Inset) => {
					Sidebar_Inset($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_3 = $.first_child(fragment_2);

							SiteHeader(node_3, {});

							var div = $.sibling(node_3, 2);
							var div_1 = $.child(div);
							var div_2 = $.child(div_1);
							var node_4 = $.child(div_2);

							SectionCards(node_4, {});

							var div_3 = $.sibling(node_4, 2);
							var node_5 = $.child(div_3);

							ChartAreaInteractive(node_5, {});
							$.reset(div_3);

							var node_6 = $.sibling(div_3, 2);

							DataTable(node_6, {
								get data() {
									return data;
								}
							});

							$.reset(div_2);
							$.reset(div_1);
							$.reset(div);
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}