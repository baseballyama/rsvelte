import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!></div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let visible = true;
	let data = 'Foo';

	function show() {
		visible = true;
	}

	function hide() {
		visible = false;
		data = 'Bar';
	}

	function fade(node) {
		return {
			duration: 100,
			tick: (t) => {
				node.foo = t;
			}
		};
	}

	var $$exports = { show, hide };
	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_2 = $.child(div);

			$.slot(node_2, $$props, 'default', {}, ($$anchor) => {
				var text = $.text();

				$.template_effect(() => $.set_text(text, data));
				$.append($$anchor, text);
			});

			$.reset(div);
			$.transition(3, div, () => fade);
			$.append($$anchor, div);
		};

		$.if(node_1, ($$render) => {
			if (visible) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}