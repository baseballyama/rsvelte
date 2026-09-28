import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { statuses } from "../data/data.js";

var root = $.from_html(`<div class="flex w-[100px] items-center"><!> <span> </span></div>`);

export default function Data_table_status_cell($$anchor, $$props) {
	$.push($$props, true);

	const status = $.derived(() => statuses.find((s) => s.value === $$props.value));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.component(node_1, () => $.get(status).icon, ($$anchor, status_icon) => {
				status_icon($$anchor, { class: 'me-2 size-4 text-muted-foreground' });
			});

			var span = $.sibling(node_1, 2);
			var text = $.only_child(span, true);

			$.reset(div);
			$.template_effect(() => $.set_text(text, $.get(status).label));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(status)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}