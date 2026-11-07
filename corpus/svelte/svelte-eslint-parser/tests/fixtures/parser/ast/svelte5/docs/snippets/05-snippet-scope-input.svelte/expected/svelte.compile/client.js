import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const blastoff = ($$anchor) => {
	var span = root();

	$.append($$anchor, span);
};

const countdown = ($$anchor, n = $.noop) => {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root_1();
			var span_1 = $.first_child(fragment_1);
			var text = $.only_child(span_1);
			var node_1 = $.sibling(span_1, 2);

			countdown(node_1, () => n() - 1);
			$.template_effect(() => $.set_text(text, `${n() ?? ''}...`));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			blastoff($$anchor);
		};

		$.if(node, ($$render) => {
			if (n() > 0) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
};

var root = $.from_html(`<span>🚀</span>`);
var root_1 = $.from_html(`<span> </span> <!>`, 1);

export default function _5_snippet_scope_input($$anchor) {
	countdown($$anchor, () => 10);
}