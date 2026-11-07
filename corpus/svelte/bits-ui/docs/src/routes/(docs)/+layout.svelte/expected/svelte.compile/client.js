import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { dev } from "$app/environment";
import Metadata from "$lib/components/metadata.svelte";
import SiteHeader from "$lib/components/site-header.svelte";
import TailwindIndicator from "$lib/components/tailwind-indicator.svelte";
import SidebarNav from "$lib/components/navigation/sidebar-nav.svelte";
import { navigation } from "$lib/config/index.js";
import "$lib/styles/app.css";
import { onMount } from "svelte";
import { page } from "$app/state";

var root = $.from_html(`<!> <!> <div class="min-h-[calc(100vh-var(--header-height))]"><div class="flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10"><!> <!></div></div> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	onMount(async () => {
		if (dev || page.url.searchParams.get("test")) {
			const eruda = (await import("eruda")).default;

			eruda.init();
		}
	});

	var fragment = root();
	var node = $.first_child(fragment);

	Metadata(node, {});

	var node_1 = $.sibling(node, 2);

	SiteHeader(node_1, {});

	var div = $.sibling(node_1, 2);
	var div_1 = $.child(div);
	var node_2 = $.child(div_1);

	SidebarNav(node_2, {
		get items() {
			return navigation.sidebar;
		}
	});

	var node_3 = $.sibling(node_2, 2);

	$.snippet(node_3, () => $$props.children);
	$.reset(div_1);
	$.reset(div);

	var node_4 = $.sibling(div, 2);

	{
		var consequent = ($$anchor) => {
			TailwindIndicator($$anchor, {});
		};

		$.if(node_4, ($$render) => {
			if (dev) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}