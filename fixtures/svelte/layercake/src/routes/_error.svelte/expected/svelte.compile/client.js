import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<pre> </pre>`);
var root_1 = $.from_html(`<div class="error svelte-spq4ih"><h1 class="svelte-spq4ih"> </h1> <p class="svelte-spq4ih"> </p> <!></div>`);
var root_2 = $.from_html(`<h1 class="svelte-spq4ih">hiase</h1> <!>`, 1);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_2();

	$.head('spq4ih', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = $$props.status ?? '';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_1();
			var h1 = $.child(div);
			var text = $.only_child(h1, true);
			var p = $.sibling(h1, 2);
			var text_1 = $.only_child(p, true);
			var node_1 = $.sibling(p, 2);

			{
				var consequent = ($$anchor) => {
					var pre = root();
					var text_2 = $.only_child(pre, true);

					$.template_effect(() => $.set_text(text_2, $$props.error.stack));
					$.append($$anchor, pre);
				};

				$.if(node_1, ($$render) => {
					if ($$props.error.stack) $$render(consequent);
				});
			}

			$.reset(div);

			$.template_effect(() => {
				$.set_text(text, $$props.status);
				$.set_text(text_1, $$props.error.message);
			});

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.error) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}