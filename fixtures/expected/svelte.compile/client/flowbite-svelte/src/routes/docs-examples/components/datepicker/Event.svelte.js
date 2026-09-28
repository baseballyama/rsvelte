import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Datepicker } from "flowbite-svelte";

var root = $.from_html(`<div class="mb-64 md:w-1/2"><!></div>`);

export default function Event($$anchor) {
	function handleDateSelect(detail) {
		console.log("Selected date:", detail);
	}

	var div = root();
	var node = $.child(div);

	Datepicker(node, { onselect: handleDateSelect });
	$.reset(div);
	$.append($$anchor, div);
}