import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { elasticOut } from 'svelte/easing';

var root = $.from_html(`<div class="text svelte-1hdyhhy">Whoooo!</div>`);
var root_1 = $.from_html(`<div class="container"><!> <button class="svelte-1hdyhhy">Replay</button></div>`);

export default function Custom_transition($$anchor, $$props) {
	$.push($$props, true);

	function customTransition(node, options) {
		const { duration = 2000, delay = 0, easing = elasticOut } = options;

		return {
			duration,
			delay,
			easing,
			css: (t) => `
				color: hsl(${360 * t} , 100%, 80%);
				transform: scale(${t});
			`
		};
	}

	let play = $.state(false);
	let replay = $.state(false);

	$.user_effect(() => {
		$.set(play, true);
	});

	var div = root_1();
	var node_1 = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.key(node_2, () => $.get(replay), ($$anchor) => {
				var div_1 = root();

				$.transition(1, div_1, () => customTransition);
				$.append($$anchor, div_1);
			});

			$.append($$anchor, fragment);
		};

		$.if(node_1, ($$render) => {
			if ($.get(play)) $$render(consequent);
		});
	}

	var button = $.sibling(node_1, 2);

	$.reset(div);
	$.delegated('click', button, () => $.set(replay, !$.get(replay)));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);