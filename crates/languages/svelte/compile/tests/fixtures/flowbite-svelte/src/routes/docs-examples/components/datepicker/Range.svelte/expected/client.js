import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Datepicker, P } from "flowbite-svelte";

var root = $.from_html(`<div class="mb-64 md:w-1/2"><!> <!></div>`);

export default function Range($$anchor) {
	let dateRange = $.proxy({ from: undefined, to: undefined });
	var div = root();
	var node = $.child(div);

	Datepicker(node, {
		range: true,
		color: 'blue',
		get rangeFrom() {
			return dateRange.from;
		},

		set rangeFrom($$value) {
			dateRange.from = $$value;
		},

		get rangeTo() {
			return dateRange.to;
		},

		set rangeTo($$value) {
			dateRange.to = $$value;
		}
	});

	var node_1 = $.sibling(node, 2);

	P(node_1, {
		class: 'mt-4',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(
				($0, $1) => $.set_text(text, `Selected range:
    ${$0 ?? ''} -
    ${$1 ?? ''}`),
				[
					() => dateRange.from ? dateRange.from.toLocaleDateString() : "None",
					() => dateRange.to ? dateRange.to.toLocaleDateString() : "None"
				]
			);

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}