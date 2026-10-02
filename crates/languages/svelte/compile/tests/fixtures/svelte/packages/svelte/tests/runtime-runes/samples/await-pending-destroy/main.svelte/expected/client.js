import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.await(
				node_1,
				() => $$props.promise,
				($$anchor) => {
					var text_2 = $.text();

					text_2.nodeValue = console.log("await");
					$.append($$anchor, text_2);
				},
				($$anchor, r) => {
					var text = $.text();

					$.template_effect(($0) => $.set_text(text, $0), [() => console.log("then:" + $.get(r))]);
					$.append($$anchor, text);
				},
				($$anchor, err) => {
					var text_1 = $.text();

					$.template_effect(($0) => $.set_text(text_1, $0), [() => console.log("catch:" + $.get(err))]);
					$.append($$anchor, text_1);
				}
			);

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.promise) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}