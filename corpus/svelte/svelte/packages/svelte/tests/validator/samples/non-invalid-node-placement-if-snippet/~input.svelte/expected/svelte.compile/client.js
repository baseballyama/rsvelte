import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<td><!></td>`);
var root_1 = $.from_html(`<table><tbody><tr></tr></tbody></table>`);

export default function Input($$anchor) {
	var table = root_1();
	var tbody = $.child(table);
	var tr = $.child(tbody);

	{
		const cell = ($$anchor, v = $.noop) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, `Value: ${v() ?? ''}`));
			$.append($$anchor, text);
		};

		$.each(tr, 20, () => [1, 2, 3], $.index, ($$anchor, v) => {
			var td = root();
			var node = $.child(td);

			cell(node, () => v);
			$.reset(td);
			$.append($$anchor, td);
		});

		$.reset(tr);
	}

	$.reset(tbody);
	$.reset(table);
	$.append($$anchor, table);
}