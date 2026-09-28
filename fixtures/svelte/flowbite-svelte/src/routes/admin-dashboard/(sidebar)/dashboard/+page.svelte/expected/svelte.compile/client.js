import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dashboard from "../../utils/dashboard/Dashboard.svelte";
import MetaTag from "../../utils/MetaTag.svelte";
import Footer from "../Footer.svelte";

var root = $.from_html(`<!> <main class="p-4"><h1 class="hidden">Dashboard</h1> <!></main> <!>`, 1);

export default function _page($$anchor) {
	// import type { PageProps } from './$types';
	// let { data }: PageProps = $props();
	// $inspect('data in dashboard/+page', data)
	const path = "/dashboard";

	const description = "Admin Dashboard example using Flowbite Svelte";
	const title = "Flowbite Svelte Admin Dashboard - Dashboard";
	const subtitle = "Admin Dashboard";
	var fragment = root();
	var node = $.first_child(fragment);

	MetaTag(node, { path, description, title, subtitle });

	var main = $.sibling(node, 2);
	var node_1 = $.sibling($.child(main), 2);

	Dashboard(node_1, {});
	$.reset(main);

	var node_2 = $.sibling(main, 2);

	Footer(node_2, {});
	$.append($$anchor, fragment);
}