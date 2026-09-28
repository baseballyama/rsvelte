import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Datepicker, P } from "flowbite-svelte";

var root = $.from_html(`<div class="mb-64 md:w-1/2"><!> <!> <!></div>`);

export default function Action($$anchor) {
	let selectedDate = $.state(undefined);
	let lastAction = $.state(void 0);

	function handleClear() {
		$.set(lastAction, "Cleared");
	}

	function handleApply(detail) {
		$.set(lastAction, "Applied");

		if (detail instanceof Date) {
			$.set(selectedDate, detail, true);
		}
	}

	var div = root();
	var node = $.child(div);

	Datepicker(node, {
		showActionButtons: true,
		autohide: false,
		onclear: handleClear,
		onapply: handleApply,
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

	var node_2 = $.sibling(node_1, 2);

	P(node_2, {
		class: 'mt-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, `Last action: ${$.get(lastAction) ?? ''}`));
			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}