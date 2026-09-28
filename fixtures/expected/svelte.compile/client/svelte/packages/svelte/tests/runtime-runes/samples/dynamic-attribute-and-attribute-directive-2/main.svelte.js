import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div> <button>switch</button>`, 1);

export default function Main($$anchor) {
	let value = $.state(0);

	function dark() {
		console.log('updated class directive');

		return true;
	}

	function get_class() {
		console.log('updated class attribute');

		return $.get(value) % 2 ? 'big' : 'small';
	}

	function color() {
		console.log('updated style directive');

		return "green";
	}

	function get_style() {
		console.log('updated style attribute');

		return $.get(value) % 2 ? 'background: red' : 'background: green';
	}

	var fragment = root();
	var div = $.first_child(fragment);
	let classes;
	var div_1 = $.sibling(div, 2);
	let styles;
	var button = $.sibling(div_1, 2);

	$.template_effect(
		($0, $1, $2, $3) => {
			classes = $.set_class(div, 1, $0, null, classes, { dark: $1 });
			styles = $.set_style(div_1, $2, styles, { color: $3 });
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