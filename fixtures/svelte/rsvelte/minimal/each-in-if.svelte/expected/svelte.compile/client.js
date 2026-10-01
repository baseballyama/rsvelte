import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<p>hidden</p>`);

export default function Each_in_if($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => $$props.list, $.index, ($$anchor, entry) => {
				var span = root();
				var text = $.only_child(span, true);

				$.template_effect(() => $.set_text(text, $.get(entry)));
				$.append($$anchor, span);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var p = root_1();

			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($$props.show) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}