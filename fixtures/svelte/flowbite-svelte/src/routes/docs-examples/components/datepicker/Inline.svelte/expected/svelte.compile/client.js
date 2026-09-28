import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Datepicker, P } from "flowbite-svelte";

var root = $.from_html(`<div class="md:w-1/2"><!> <!></div>`);

export default function Inline($$anchor) {
	let selectedDate = $.state(undefined);
	var div = root();
	var node = $.child(div);

	Datepicker(node, {
		inline: true,
		get value() {
			return $.get(selectedDate);
		},

		set value($$value) {
			$.set(selectedDate, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	P(node_1, {
		class: 'mt-4',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(($0) => $.set_text(text, `Selected date: ${$0 ?? ''}`), [
				() => $.get(selectedDate) ? $.get(selectedDate).toLocaleDateString() : "None"
			]);

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}