import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const counter = ($$anchor, c = $.noop) => {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var button = root();
			var text = $.only_child(button, true);

			$.template_effect(() => $.set_text(text, c().value));
			$.event('click', button, () => c().value += 1);
			$.append($$anchor, button);
		};

		var alternate = ($$anchor) => {
			var p = root_1();

			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if (c()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
};

var root = $.from_html(`<button> </button>`);
var root_1 = $.from_html(`<p>fallback</p>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Main($$anchor) {
	function box(value) {
		let state = $.state($.proxy(value));

		return {
			get value() {
				return $.get(state);
			},

			set value(v) {
				$.set(state, v, true);
			}
		};
	}

	let count = box(0);
	var fragment_1 = root_2();
	var node_1 = $.first_child(fragment_1);

	counter(node_1);

	var node_2 = $.sibling(node_1, 2);

	counter(node_2, () => count);
	$.append($$anchor, fragment_1);
}