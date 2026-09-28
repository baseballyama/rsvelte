import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<strong>during</strong>`);
var root_1 = $.from_html(`<button>toggle</button> <p>before</p> <!> <p>after</p>`, 1);

export default function Main($$anchor) {
	let condition = $.state(false);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 4);

	{
		var consequent = ($$anchor) => {
			var strong = root();

			$.append($$anchor, strong);
		};

		$.if(node, ($$render) => {
			if ($.get(condition)) $$render(consequent);
		});
	}

	$.next(2);
	$.delegated('click', button, () => $.set(condition, !$.get(condition)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);