import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="date svelte-l1v42m"><i class="wxi-calendar svelte-l1v42m"></i> <span> </span></div>`);
var root_1 = $.from_html(`<span class="empty svelte-l1v42m">no date</span>`);

export default function EditorDateCell($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var span = $.sibling($.child(div), 2);
			var text = $.only_child(span, true);

			$.reset(div);
			$.template_effect(($0) => $.set_text(text, $0), [() => $$props.data.toLocaleDateString()]);
			$.append($$anchor, div);
		};

		var alternate = ($$anchor) => {
			var span_1 = root_1();

			$.append($$anchor, span_1);
		};

		$.if(node, ($$render) => {
			if ($$props.data) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}