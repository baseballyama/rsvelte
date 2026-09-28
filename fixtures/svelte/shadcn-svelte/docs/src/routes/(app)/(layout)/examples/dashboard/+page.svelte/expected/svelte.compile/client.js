import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import Metadata from "$lib/components/metadata.svelte";
import AppSidebar from "./components/app-sidebar.svelte";
import ChartAreaInteractive from "./components/chart-area-interactive.svelte";
import DataTable from "./components/data-table.svelte";
import SectionCards from "./components/section-cards.svelte";
import SiteHeader from "./components/site-header.svelte";
import { data } from "./data.js";

var root = $.from_html(`<!> <div class="flex flex-1 flex-col"><div class="@container/main flex flex-1 flex-col gap-2"><div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6"><!> <div class="px-4 lg:px-6"><!></div> <!></div></div></div>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <div class="md:hidden"><img src="/img/examples/dashboard-light.png" alt="Dashboard" class="block dark:hidden"/> <img src="/img/examples/dashboard-dark.png" alt="Dashboard" class="hidden dark:block"/></div> <!>`, 1);

export default function _page($$anchor) {
	const title = "Dashboard";
	const description = "A dashboard built using the components.";
	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => ({
			url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`
		}));

		Metadata(node, {
			title,
			description,
			get ogImage() {
				return $.get($0);
			}
		});
	}

	var div = $.sibling(node, 2);
	var img = $.child(div);

	$.set_attribute(img, 'width', 1280);
	$.set_attribute(img, 'height', 843);

	var img_1 = $.sibling(img, 2);

	$.set_attribute(img_1, 'width', 1280);
	$.set_attribute(img_1, 'height', 843);
	$.reset(div);

	var node_1 = $.sibling(div, 2);

	$.component(node_1, () => Sidebar.Provider, ($$anchor, Sidebar_Provider) => {
		Sidebar_Provider($$anchor, {
			class: 'hidden md:flex',
			style: '--sidebar-width: calc(var(--spacing) * 64); --header-height: calc(var(--spacing) * 12 + 1px);',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_2 = $.first_child(fragment_1);

				AppSidebar(node_2, { variant: 'sidebar' });

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => Sidebar.Inset, ($$anchor, Sidebar_Inset) => {
					Sidebar_Inset($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_4 = $.first_child(fragment_2);

							SiteHeader(node_4, {});

							var div_1 = $.sibling(node_4, 2);
							var div_2 = $.child(div_1);
							var div_3 = $.child(div_2);
							var node_5 = $.child(div_3);

							SectionCards(node_5, {});

							var div_4 = $.sibling(node_5, 2);
							var node_6 = $.child(div_4);

							ChartAreaInteractive(node_6, {});
							$.reset(div_4);

							var node_7 = $.sibling(div_4, 2);

							DataTable(node_7, {
								get data() {
									return data;
								}
							});

							$.reset(div_3);
							$.reset(div_2);
							$.reset(div_1);
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