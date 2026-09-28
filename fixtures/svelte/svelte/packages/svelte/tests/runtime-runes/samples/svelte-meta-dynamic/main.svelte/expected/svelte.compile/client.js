import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>toggle</button> <!> <!> <!>`, 1);

export default function Main($$anchor) {
	let condition = $.state(false);
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.element(node, () => 'p', false, ($$element, $$anchor) => {
		var text = $.text('before');

		$.append($$anchor, text);
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.element(node_2, () => 'strong', false, ($$element_1, $$anchor) => {
				var text_1 = $.text('during');

				$.append($$anchor, text_1);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(condition)) $$render(consequent);
		});
	}

	var node_3 = $.sibling(node_1, 2);

	$.element(node_3, () => 'p', false, ($$element_2, $$anchor) => {
		var text_2 = $.text('after');

		$.append($$anchor, text_2);
	});

	$.delegated('click', button, () => $.set(condition, !$.get(condition)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);