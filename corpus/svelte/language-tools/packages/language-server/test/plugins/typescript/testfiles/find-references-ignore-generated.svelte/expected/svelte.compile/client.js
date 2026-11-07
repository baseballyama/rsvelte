import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Find_references_ignore_generated($$anchor) {
	let a = null;
	let promise = Promise.resolve(true);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.await(node_1, () => promise, ($$anchor) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				{
					var consequent = ($$anchor) => {
						var text = $.text();

						$.template_effect(() => $.set_text(text, promise));
						$.append($$anchor, text);
					};

					$.if(node_2, ($$render) => {
						if (typeof a === 'string') $$render(consequent);
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (a) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
}