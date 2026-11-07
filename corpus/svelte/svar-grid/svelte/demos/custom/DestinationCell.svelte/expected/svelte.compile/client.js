import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="empty svelte-100i8wr">not selected</span>`);
var root_1 = $.from_html(`<span><!></span>`);

export default function DestinationCell($$anchor, $$props) {
	$.push($$props, true);

	const countriesCount = $.derived(() => $.get(data).length);

	let data = $.derived(() => {
		const ids = $$props.row[$$props.column.id];
		const options = $$props.column.options;

		if (!Array.isArray(ids) || !options) return [];

		return ids.map((id) => options.find((o) => o.id == id)).filter(Boolean);
	});

	var span = root_1();
	var node = $.child(span);

	{
		var consequent = ($$anchor) => {
			var text = $.text();

			$.template_effect(($0) => $.set_text(text, $0), [() => $.get(data).map((item) => item.label).join(", ")]);
			$.append($$anchor, text);
		};

		var consequent_1 = ($$anchor) => {
			var text_1 = $.text();

			$.template_effect(($0) => $.set_text(text_1, `${$0 ?? ''} and ${$.get(countriesCount) - 3} more`), [
				() => $.get(data).slice(0, 3).map((item) => item.label).join(", ")
			]);

			$.append($$anchor, text_1);
		};

		var alternate = ($$anchor) => {
			var span_1 = root();

			$.append($$anchor, span_1);
		};

		$.if(node, ($$render) => {
			if ($.get(countriesCount) && $.get(countriesCount) <= 3) $$render(consequent); else if ($.get(countriesCount) > 3) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.reset(span);
	$.append($$anchor, span);
	$.pop();
}