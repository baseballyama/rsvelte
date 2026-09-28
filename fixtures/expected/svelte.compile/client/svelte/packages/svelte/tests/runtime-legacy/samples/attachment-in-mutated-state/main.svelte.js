import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<button> </button> <!>`, 1);

export default function Main($$anchor) {
	let state = {
		count: 0,
		attachment() {
			console.log('up');

			return () => console.log('down');
		}
	};

	var fragment = root_1();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.attach(div, () => state.attachment);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (state.count < 2) $$render(consequent);
		});
	}

	$.template_effect(() => $.set_text(text, state.count));
	$.delegated('click', button, () => state.count++);
	$.append($$anchor, fragment);
}

$.delegate(['click']);