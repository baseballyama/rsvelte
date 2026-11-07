import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Datepicker } from "flowbite-svelte";

var root = $.from_html(`<div class="mb-64 md:w-1/2"><!></div>`);

export default function Color($$anchor) {
	var div = root();
	var node = $.child(div);

	Datepicker(node, {
		color: 'blue',
		classes: {
			polite: "hover:text-blue-700!",
			dayButton: "hover:text-blue-400",
			titleVariant: "text-blue-800",
			monthButton: "text-blue-700"
		},
		title: 'Select your preferred date',
		monthBtnSelected: 'bg-blue-200'
	});

	$.reset(div);
	$.append($$anchor, div);
}