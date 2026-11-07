import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MetaTag from "../../../utils/MetaTag.svelte";
import Footer from "../../Footer.svelte";
import { Playground } from "flowbite-svelte-admin-dashboard";

var root = $.from_html(`<!> <div id="main-content" class="relative mx-auto h-full w-full overflow-y-auto bg-gray-50 p-4 dark:bg-gray-900"><!></div> <!>`, 1);

export default function _page($$anchor) {
	const path = "/playground/sidebar";
	const description = "Playground Sidebar example - Flowbite Svelte Admin Dashboard";
	const metaTitle = "Flowbite Svelte Admin Dashboard - Playground Sidebar";
	const subtitle = "Playground Sidebar";
	var fragment = root();
	var node = $.first_child(fragment);

	MetaTag(node, { path, description, title: metaTitle, subtitle });

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Playground(node_1, {});
	$.reset(div);

	var node_2 = $.sibling(div, 2);

	Footer(node_2, {});
	$.append($$anchor, fragment);
}