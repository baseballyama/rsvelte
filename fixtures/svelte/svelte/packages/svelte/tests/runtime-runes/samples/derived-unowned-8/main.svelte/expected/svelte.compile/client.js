import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

let visible = $.state(true);

function toggleVisibility() {
	$.set(visible, !$.get(visible));
}

let unchangedState = 'unchanged state';

let derived = $.derived(() => {
	console.log('recalculating');

	return unchangedState;
});

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<button>Toggle Visibility</button> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text = $.only_child(p, true);

			$.template_effect(() => $.set_text(text, $.get(derived)));
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($.get(visible)) $$render(consequent);
		});
	}

	$.delegated('click', button, toggleVisibility);
	$.append($$anchor, fragment);
}

$.delegate(['click']);