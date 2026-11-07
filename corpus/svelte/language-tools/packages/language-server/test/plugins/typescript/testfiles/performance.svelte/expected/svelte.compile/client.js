import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Inner Content</p>`);
var root_1 = $.from_html(`<div><p>lorem ipsum</p> <!></div> <!>`, 1);

export default function Performance($$anchor, $$props) {
	function aFunction(param) {
		param += 1; // should error

		const foo = subFunction();

		function subFunction() {
			return param ? 1 : 2;
		}
	}

	function handleClick(e) {
		aFunction(true); // should error

		const foo = 'bar';
	}

	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.sibling($.child(div), 2);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(div);

	var node_1 = $.sibling(div, 2);

	NonExistentComponent(node_1, {
		propA: 1,
		$$events: {
			event: (evt) => {
				const result = evt.detail ? aFunction(false) : aFunction('right');

				result;
			}
		},

		children: ($$anchor, $$slotProps) => {
			var p = root();

			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});

	$.event('click', div, handleClick);
	$.append($$anchor, fragment);
}