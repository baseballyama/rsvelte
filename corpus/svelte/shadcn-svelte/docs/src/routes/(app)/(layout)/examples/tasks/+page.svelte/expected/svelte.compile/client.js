import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DataTable from "./components/data-table.svelte";
import UserNav from "./components/user-nav.svelte";
import { data } from "./data/tasks.js";

var root = $.from_html(`<div class="md:hidden"><img src="/img/examples/tasks-light.png" alt="Tasks" class="block dark:hidden"/> <img src="/img/examples/tasks-dark.png" alt="Tasks" class="hidden dark:block"/></div> <div class="hidden h-full flex-1 flex-col gap-8 p-8 md:flex"><div class="flex items-center justify-between gap-2"><div class="flex flex-col gap-1"><h2 class="text-2xl font-semibold tracking-tight">Welcome back!</h2> <p class="text-muted-foreground">Here&apos;s a list of your tasks for this month.</p></div> <div class="flex items-center gap-2"><!></div></div> <!></div>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var div = $.sibling($.first_child(fragment), 2);
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var node = $.child(div_2);

	UserNav(node, {});
	$.reset(div_2);
	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	DataTable(node_1, {
		get data() {
			return data;
		}
	});

	$.reset(div);
	$.append($$anchor, fragment);
}