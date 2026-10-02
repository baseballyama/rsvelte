import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dashboard from "../../../utils/dashboard/Dashboard.svelte";
import MetaTag from "../../../utils/MetaTag.svelte";
import Footer from "../../Footer.svelte";

var root = $.from_html(`<!> <main class="p-4"><h1 class="hidden">Layouts: Sidebar</h1> <!></main> <!>`, 1);

export default function _page($$anchor) {
	const path = "/layouts/sidebar";
	const description = "Sidebar layout examaple - Flowbite Svelte Admin Dashboard";
	const title = "Flowbite Svelte Admin Dashboard - Sidebar Layout";
	const subtitle = "Sidebar Layout";
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