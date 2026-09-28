import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <!>`, 1);

export default function Main($$anchor) {
	let count = $.state(0);
	let button = $.state(void 0);

	function do_thing() {
		$.get(button)?.click();

		return false;
	}

	var fragment = root();
	var button_1 = $.first_child(fragment);
	var text = $.only_child(button_1, true);

	$.bind_this(button_1, ($$value) => $.set(button, $$value), () => $.get(button));

	var node = $.sibling(button_1, 2);

	{
		var consequent = ($$anchor) => {};
		var d = $.derived(() => do_thing());

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	$.template_effect(() => $.set_text(text, $.get(count)));
	$.delegated('click', button_1, () => $.update(count));
	$.append($$anchor, fragment);
}

$.delegate(['click']);