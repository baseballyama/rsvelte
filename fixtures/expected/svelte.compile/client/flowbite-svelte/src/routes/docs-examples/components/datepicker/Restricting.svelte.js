import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Datepicker, P } from "flowbite-svelte";

var root = $.from_html(` <br/> Range: 10 days before today to 10 days after today`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Restricting($$anchor, $$props) {
	$.push($$props, true);

	let selectedDate = $.state(undefined);

	// Helper function to add/subtract days
	function addDays(date, days) {
		const result = new Date(date);

		result.setDate(result.getDate() + days);

		return result;
	}

	// Calculate dates relative to today
	const today = new Date();

	const availableFrom = addDays(today, -10); // 10 days ago
	const availableTo = addDays(today, 10); // 10 days from now

	function formatDate(date) {
		return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
	}

	var fragment = root_1();
	var node = $.first_child(fragment);

	Datepicker(node, {
		get availableFrom() {
			return availableFrom;
		},

		get availableTo() {
			return availableTo;
		},
		placeholder: 'Select available date',
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

			$.template_effect(($0, $1) => $.set_text(text, `Available from: ${$0 ?? ''} to: ${$1 ?? ''}`), [
				() => formatDate(availableFrom),
				() => formatDate(availableTo)
			]);

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	P(node_2, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text();

			$.template_effect(($0) => $.set_text(text_1, `Selected date: ${$0 ?? ''}`), [
				() => $.get(selectedDate) ? formatDate($.get(selectedDate)) : "None selected"
			]);

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	P(node_3, {
		class: 'mt-4 text-sm text-gray-600',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_3 = root();
			var text_2 = $.first_child(fragment_3);

			$.next(2);
			$.template_effect(($0) => $.set_text(text_2, `Today: ${$0 ?? ''} `), [() => formatDate(today)]);
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}