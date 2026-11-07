import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SearchList from "./components/SearchList.svelte";
import Form from "./components/Form.svelte";
import CalendarUploader from "./components/CalendarUploader.svelte";
import RadioCheckboxes from "./components/RadioCheckboxes.svelte";
import Topbar from "./components/Topbar.svelte";

var root = $.from_html(`<div class="demo svelte-l0ke6q"><div class="wrapper svelte-l0ke6q"><!> <div class="columns svelte-l0ke6q"><!> <!> <!> <!></div></div></div>`);

export default function Main($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Topbar(node, {});

	var div_2 = $.sibling(node, 2);
	var node_1 = $.child(div_2);

	CalendarUploader(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	SearchList(node_2, {});

	var node_3 = $.sibling(node_2, 2);

	Form(node_3, {});

	var node_4 = $.sibling(node_3, 2);

	RadioCheckboxes(node_4, {});
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}