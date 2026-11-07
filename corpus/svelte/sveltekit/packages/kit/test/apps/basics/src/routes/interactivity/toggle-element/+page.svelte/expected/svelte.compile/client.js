import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>remove</button> <a>remove</a>`, 1);
var root_1 = $.from_html(`<button>add</button> <a>add</a>`, 1);

export default function _page($$anchor) {
	let visible = true;

	function toggle() {
		visible = !visible;
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var button = $.first_child(fragment_1);
			var a = $.sibling(button, 2);

			$.delegated('click', button, toggle);
			$.delegated('click', a, toggle);
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = root_1();
			var button_1 = $.first_child(fragment_2);
			var a_1 = $.sibling(button_1, 2);

			$.delegated('click', button_1, toggle);
			$.delegated('click', a_1, toggle);
			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if (visible) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}

$.delegate(['click']);