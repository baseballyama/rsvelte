import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container svelte-1yvh7he"><div class="avatar svelte-1yvh7he"><span class="svelte-1yvh7he"> </span></div> <span class="name"> </span></div>`);
var root_1 = $.from_html(`<span class="empty svelte-1yvh7he">not selected</span>`);

export default function EditorSelectCell($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var div_1 = $.child(div);
			var span = $.child(div_1);
			var text = $.only_child(span, true);

			$.reset(div_1);

			var span_1 = $.sibling(div_1, 2);
			var text_1 = $.only_child(span_1, true);

			$.reset(div);

			$.template_effect(() => {
				$.set_text(text, $$props.data.label[0]);
				$.set_text(text_1, $$props.data.label);
			});

			$.append($$anchor, div);
		};

		var alternate = ($$anchor) => {
			var span_2 = root_1();

			$.append($$anchor, span_2);
		};

		$.if(node, ($$render) => {
			if ($$props.data) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}