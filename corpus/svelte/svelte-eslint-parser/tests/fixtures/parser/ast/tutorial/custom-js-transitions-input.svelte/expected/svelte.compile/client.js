import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>The quick brown fox jumps over the lazy dog</p>`);
var root_1 = $.from_html(`<label><input type="checkbox"/> visible</label> <!>`, 1);

export default function Custom_js_transitions_input($$anchor, $$props) {
	$.push($$props, true);

	let visible = false;

	function typewriter(node, { speed = 50 }) {
		const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;

		if (!valid) {
			throw new Error(`This transition only works on elements with a single text node child`);
		}

		const text = node.textContent;
		const duration = text.length * speed;

		return {
			duration,
			tick: (t) => {
				const i = ~~(text.length * t);

				node.textContent = text.slice(0, i);
			}
		};
	}

	var fragment = root_1();
	var label = $.first_child(fragment);
	var input = $.child(label);

	$.remove_input_defaults(input);
	$.next();
	$.reset(label);

	var node_1 = $.sibling(label, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.transition(1, p, () => typewriter);
			$.append($$anchor, p);
		};

		$.if(node_1, ($$render) => {
			if (visible) $$render(consequent);
		});
	}

	$.bind_checked(input, () => visible, ($$value) => visible = $$value);
	$.append($$anchor, fragment);
	$.pop();
}