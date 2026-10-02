import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { quintOut } from 'svelte/easing';
import { fade, draw, fly } from 'svelte/transition';
import { expand } from './custom-transitions.js';
import { inner, outer } from './shape.js';

var root = $.from_html(`<span class="svelte-1ylurb2"> </span>`);
var root_1 = $.from_html(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 103 124" class="svelte-1ylurb2"><g opacity="0.2"><path style="stroke: #ff3e00; fill: #ff3e00; stroke-width: 50;" class="svelte-1ylurb2"></path><path style="stroke:#ff3e00; stroke-width: 1.5" class="svelte-1ylurb2"></path></g></svg> <div class="centered svelte-1ylurb2"></div>`, 1);
var root_2 = $.from_html(`<!> <label class="svelte-1ylurb2"><input type="checkbox"/> toggle me</label> <link href="https://fonts.googleapis.com/css?family=Overpass:100,400" rel="stylesheet"/>`, 1);

export default function Hello_world05_input($$anchor) {
	let visible = true;
	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root_1();
			var svg = $.first_child(fragment_1);
			var g = $.child(svg);
			var path = $.child(g);
			var path_1 = $.sibling(path);

			$.reset(g);
			$.reset(svg);

			var div = $.sibling(svg, 2);

			$.each(div, 20, () => 'SVELTE', $.index, ($$anchor, char, i) => {
				var span = root();
				var text = $.only_child(span, true);

				$.template_effect(() => $.set_text(text, char));
				$.transition(1, span, () => fade, () => ({ delay: 1000 + i * 150, duration: 800 }));
				$.append($$anchor, span);
			});

			$.reset(div);

			$.template_effect(() => {
				$.set_attribute(path, 'd', outer);
				$.set_attribute(path_1, 'd', inner);
			});

			$.transition(1, path, () => expand, () => ({ duration: 400, delay: 1000, easing: quintOut }));
			$.transition(1, path_1, () => draw, () => ({ duration: 1000 }));
			$.transition(2, g, () => fade, () => ({ duration: 200 }));
			$.transition(2, div, () => fly, () => ({ y: -20, duration: 800 }));
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (visible) $$render(consequent);
		});
	}

	var label = $.sibling(node, 2);
	var input = $.child(label);

	$.remove_input_defaults(input);
	$.next();
	$.reset(label);
	$.next(2);
	$.bind_checked(input, () => visible, ($$value) => visible = $$value);
	$.append($$anchor, fragment);
}