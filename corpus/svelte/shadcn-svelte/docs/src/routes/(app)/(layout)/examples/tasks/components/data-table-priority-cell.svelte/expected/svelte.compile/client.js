import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { priorities } from "../data/data.js";

var root = $.from_html(`<div class="flex items-center"><!> <span> </span></div>`);

export default function Data_table_priority_cell($$anchor, $$props) {
	$.push($$props, true);

	const priority = $.derived(() => priorities.find((p) => p.value === $$props.value));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.component(node_1, () => $.get(priority).icon, ($$anchor, priority_icon) => {
				priority_icon($$anchor, { class: 'me-2 size-4 text-muted-foreground' });
			});

			var span = $.sibling(node_1, 2);
			var text = $.only_child(span, true);

			$.reset(div);
			$.template_effect(() => $.set_text(text, $.get(priority).label));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(priority)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}