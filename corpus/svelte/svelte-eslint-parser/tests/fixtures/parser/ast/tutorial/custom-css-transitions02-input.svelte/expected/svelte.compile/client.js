import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';
import { elasticOut } from 'svelte/easing';

var root = $.from_html(`<div class="centered svelte-15k3bdq"><span class="svelte-15k3bdq">transitions!</span></div>`);
var root_1 = $.from_html(`<label><input type="checkbox"/> visible</label> <!>`, 1);

export default function Custom_css_transitions02_input($$anchor, $$props) {
	$.push($$props, true);

	let visible = true;

	function spin(node, { duration }) {
		return {
			duration,
			css: (t) => {
				const eased = elasticOut(t);

				return `
					transform: scale(${eased}) rotate(${eased * 1080}deg);
					color: hsl(
						${~~(t * 360)},
						${Math.min(100, 1000 - 1000 * t)}%,
						${Math.min(50, 500 - 500 * t)}%
					);`;
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