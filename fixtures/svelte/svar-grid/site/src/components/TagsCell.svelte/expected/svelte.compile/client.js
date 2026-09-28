import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getData } from "../data/index";

var root = $.from_html(`<span class="tag svelte-nyssxx"> </span>`);
var root_1 = $.from_html(`<div class="tags svelte-nyssxx"><div class="tags-wrapper svelte-nyssxx"></div></div>`);

export default function TagsCell($$anchor, $$props) {
	$.push($$props, true);

	const tagsData = getData().tags;

	function getTags(data, value) {
		const result = [];

		for (let i = 0; i < data.length; i++) {
			const item = data[i];

			if (value.indexOf(item.id) !== -1) result.push(item);
			if (result.length === value.length) break;
		}

		return result;
	}

	let tags = $.derived(() => getTags(tagsData, $$props.row[$$props.column.id]));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root_1();
			var div_1 = $.child(div);

			$.each(div_1, 21, () => $.get(tags), (tag) => tag.id, ($$anchor, tag) => {
				var span = root();
				var text = $.only_child(span, true);

				$.template_effect(() => {
					$.set_style(span, `background:${$.get(tag).background ?? ''};color:${$.get(tag).color ?? ''}`);
					$.set_text(text, $.get(tag).label);
				});

				$.append($$anchor, span);
			});

			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(tags).length) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}