import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>toggle</button> <button> </button> <p> </p> <!>`, 1);

export default function Main($$anchor) {
	let show = $.state(false);
	let count = $.state(0);
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var text = $.only_child(button_1);
	var p = $.sibling(button_1, 2);
	var text_1 = $.only_child(p);
	var node = $.sibling(p, 2);

	{
		var consequent = ($$anchor) => {
			NonExistent($$anchor, {});
		};

		$.if(node, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.template_effect(() => {
		$.set_text(text, `count: ${$.get(count) ?? ''}`);
		$.set_text(text_1, `show: ${$.get(show) ?? ''}`);
	});

	$.delegated('click', button, () => $.set(show, !$.get(show)));
	$.delegated('click', button_1, () => $.set(count, $.get(count) + 1));
	$.append($$anchor, fragment);
}

$.delegate(['click']);