import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Search, Button } from "flowbite-svelte";

var root = $.from_html(`<form id="example-form"><!> <!></form>`);

export default function ElementRef($$anchor) {
	let searchRef = $.state(void 0);
	let elementTxt = $.state("This text has NOT been updated.");
	var form = root();
	var node = $.child(form);

	Search(node, {
		get value() {
			return $.get(elementTxt);
		},

		set value($$value) {
			$.set(elementTxt, $$value, true);
		},

		get elementRef() {
			return $.get(searchRef);
		},

		set elementRef($$value) {
			$.set(searchRef, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		class: 'mt-2',
		onclick: () => {
			$.get(searchRef)?.setRangeText("ALREADY", 14, 17, "select");
			$.get(searchRef)?.select();
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Update text');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(form);
	$.append($$anchor, form);
}