import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div> <button> </button>`, 1);

export default function Main($$anchor) {
	let value = $.state(0);

	function dark() {
		console.log('called');

		return false;
	}

	function get_class() {
		return 'dark';
	}

	function color() {
		console.log('called');

		return 'red';
	}

	function get_style() {
		return 'color: green';
	}

	var fragment = root();
	var div = $.first_child(fragment);
	let classes;
	var div_1 = $.sibling(div, 2);
	let styles;
	var button = $.sibling(div_1, 2);
	var text = $.only_child(button, true);

	$.template_effect(
		($0, $1, $2, $3) => {
			classes = $.set_class(div, 1, $0, null, classes, { dark: $1 });
			styles = $.set_style(div_1, $2, styles, { color: $3 });
			$.set_text(text, $.get(value));
		},
		[
			() => $.clsx(get_class()),
			() => dark(),
			() => get_style(),
			() => color()
		]
	);

	$.delegated('click', button, () => $.update(value));
	$.append($$anchor, fragment);
}

$.delegate(['click']);