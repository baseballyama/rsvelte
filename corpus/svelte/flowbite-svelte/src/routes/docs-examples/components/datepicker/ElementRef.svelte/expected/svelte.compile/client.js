import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Datepicker, Button } from "flowbite-svelte";

var root = $.from_html(`<!> <div class="mt-4 flex flex-wrap gap-2"><!> <!> <!></div>`, 1);

export default function ElementRef($$anchor) {
	let datepickerRef = $.state(void 0);
	let selectedDate = $.state(void 0);
	var fragment = root();
	var node = $.first_child(fragment);

	Datepicker(node, {
		placeholder: 'Select a date',
		get elementRef() {
			return $.get(datepickerRef);
		},

		set elementRef($$value) {
			$.set(datepickerRef, $$value, true);
		},

		get value() {
			return $.get(selectedDate);
		},

		set value($$value) {
			$.set(selectedDate, $$value, true);
		}
	});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Button(node_1, {
		onclick: () => $.get(datepickerRef)?.focus(),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Focus Datepicker');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		onclick: () => $.get(datepickerRef)?.select(),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Select All Text');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		onclick: () => $.get(datepickerRef)?.blur(),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Blur Datepicker');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}