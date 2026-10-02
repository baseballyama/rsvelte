import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dashboard from "../../../utils/dashboard/Dashboard.svelte";
import MetaTag from "../../../utils/MetaTag.svelte";

var root = $.from_html(`<!> <main class="py-4"><h1 class="hidden">Layouts: Stacked</h1> <!></main>`, 1);

export default function _page($$anchor) {
	const path = "/layouts/stacked";
	const description = "Stacked layout examaple - Flowbite Svelte Admin Dashboard";
	const title = "Flowbite Svelte Admin Dashboard - Stacked Layout";
	const subtitle = "Stacked Layout";
	var fragment = root();
	var node = $.first_child(fragment);

	MetaTag(node, { path, description, title, subtitle });

	var main = $.sibling(node, 2);
	var node_1 = $.sibling($.child(main), 2);

	Dashboard(node_1, {});
	$.reset(main);
	$.append($$anchor, fragment);
}