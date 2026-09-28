import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "@svar-ui/svelte-core";

var root = $.from_html(`<span class="name svelte-1bbmz5f"> </span> <!>`, 1);

export default function ButtonCell($$anchor, $$props) {
	$.push($$props, true);

	function onClick() {
		$$props.onaction && $$props.onaction({
			action: "custom-button",
			data: { column: $$props.column.id, row: $$props.row.id }
		});
	}

	var fragment = root();
	var span = $.first_child(fragment);
	var text = $.only_child(span, true);
	var node = $.sibling(span, 2);

	{
		let $0 = $.derived(() => !$$props.row[$$props.column.id]);

		Button(node, {
			type: 'primary',
			get disabled() {
				return $.get($0);
			},
			onclick: onClick,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Show on map');

				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		});
	}

	$.template_effect(() => $.set_text(text, $$props.row[$$props.column.id] || "Unknown"));
	$.append($$anchor, fragment);
	$.pop();
}