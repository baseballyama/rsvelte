import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="color_block svelte-1wiuuwy"><span class="svelte-1wiuuwy"> </span></div>`);

export default function ColorCell($$anchor, $$props) {
	$.push($$props, true);

	const value = $.derived(() => $$props.row[$$props.column.id]);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var span = $.child(div);
			var text = $.only_child(span, true);

			$.reset(div);

			$.template_effect(() => {
				$.set_style(div, `background-color:${$.get(value) ?? ''}`);
				$.set_text(text, $.get(value));
			});

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(value)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}