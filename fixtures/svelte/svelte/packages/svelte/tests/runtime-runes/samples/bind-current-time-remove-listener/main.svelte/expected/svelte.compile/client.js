import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<audio></audio>`);
var root_1 = $.from_html(`<button></button> <!>`, 1);

export default function Main($$anchor) {
	let show = $.state(true);
	let time = $.state(0);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var audio = root();

			$.bind_current_time(audio, () => $.get(time), (new_time) => {
				console.log("event");
				$.set(time, new_time, true);
			});

			$.append($$anchor, audio);
		};

		$.if(node, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.set(show, false));
	$.append($$anchor, fragment);
}

$.delegate(['click']);