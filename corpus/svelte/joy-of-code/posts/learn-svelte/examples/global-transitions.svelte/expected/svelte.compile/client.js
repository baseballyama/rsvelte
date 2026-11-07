import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<div class="items svelte-flcjwr"></div>`);
var root_2 = $.from_html(`<div class="container"><!> <button class="svelte-flcjwr">Replay</button></div>`);

export default function Global_transitions($$anchor, $$props) {
	$.push($$props, true);

	let play = $.state(false);
	let replay = $.state(false);

	$.user_effect(() => {
		$.set(play, true);
	});

	var div = root_2();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.key(node_1, () => $.get(replay), ($$anchor) => {
				var div_1 = root_1();

				$.each(div_1, 20, () => Array(50), $.index, ($$anchor, $$item, i) => {
					var div_2 = root();

					div_2.textContent = i + 1;
					$.transition(5, div_2, () => fade, () => ({ delay: i * 100 }));
					$.append($$anchor, div_2);
				});

				$.reset(div_1);
				$.append($$anchor, div_1);
			});

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($.get(play)) $$render(consequent);
		});
	}

	var button = $.sibling(node, 2);

	$.reset(div);
	$.delegated('click', button, () => $.set(replay, !$.get(replay)));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);