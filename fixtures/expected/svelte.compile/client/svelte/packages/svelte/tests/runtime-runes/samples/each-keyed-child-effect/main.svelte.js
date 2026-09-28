import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<p> </p> <!>`, 1);
var root_2 = $.from_html(`<button>reverse</button> <!>`, 1);

export default function Main($$anchor) {
	let array = $.proxy([1, 2, 3]);
	var fragment = root_2();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.each(node, 16, () => array, (item) => item, ($$anchor, item) => {
		var fragment_1 = root_1();
		var p = $.first_child(fragment_1);
		var text = $.only_child(p, true);
		var node_1 = $.sibling(p, 2);

		{
			var consequent = ($$anchor) => {
				var p_1 = root();
				var text_1 = $.only_child(p_1);

				$.template_effect(() => $.set_text(text_1, `(${item ?? ''})`));
				$.append($$anchor, p_1);
			};

			$.if(node_1, ($$render) => {
				if (true) $$render(consequent);
			});
		}

		$.template_effect(() => $.set_text(text, item));
		$.append($$anchor, fragment_1);
	});

	$.delegated('click', button, () => array.reverse());
	$.append($$anchor, fragment);
}

$.delegate(['click']);