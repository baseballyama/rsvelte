import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <button>reset</button>`, 1);
var root_1 = $.from_html(`<p> </p>`);
var root_2 = $.from_html(`<button>toggle</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let must_throw = $.state(false);

	function throw_error() {
		throw new Error('yikes!');
	}

	var fragment = root_2();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		const failed = ($$anchor, error = $.noop, reset = $.noop) => {
			var fragment_1 = root();
			var p = $.first_child(fragment_1);
			var text = $.only_child(p, true);
			var button_1 = $.sibling(p, 2);

			$.template_effect(() => $.set_text(text, error().message));

			$.delegated('click', button_1, function (...$$args) {
				reset()?.apply(this, $$args);
			});

			$.append($$anchor, fragment_1);
		};

		$.boundary(node, { failed }, ($$anchor) => {
			var p_1 = root_1();
			var text_1 = $.only_child(p_1, true);

			$.template_effect(($0) => $.set_text(text_1, $0), [() => $.get(must_throw) ? throw_error() : 'hello!']);
			$.append($$anchor, p_1);
		});
	}

	$.delegated('click', button, () => $.set(must_throw, !$.get(must_throw)));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);