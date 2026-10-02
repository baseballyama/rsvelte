import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="centered svelte-1lcbgpd"><span class="svelte-1lcbgpd">transitions!</span></div>`);
var root_1 = $.from_html(`<label><input type="checkbox"/> visible</label> <!>`, 1);

export default function Custom_css_transitions01_input($$anchor, $$props) {
	$.push($$props, true);

	function fade(node, { delay = 0, duration = 400 }) {
		const o = +getComputedStyle(node).opacity;

		return { delay, duration, css: (t) => `opacity: ${t * o}` };
	}

	let visible = true;

	function spin(node, { duration }) {
		return { duration, css: (t) => `` };
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
			var div = root();

			$.transition(1, div, () => spin, () => ({ duration: 8000 }));
			$.transition(2, div, () => fade);
			$.append($$anchor, div);
		};

		$.if(node_1, ($$render) => {
			if (visible) $$render(consequent);
		});
	}

	$.bind_checked(input, () => visible, ($$value) => visible = $$value);
	$.append($$anchor, fragment);
	$.pop();
}