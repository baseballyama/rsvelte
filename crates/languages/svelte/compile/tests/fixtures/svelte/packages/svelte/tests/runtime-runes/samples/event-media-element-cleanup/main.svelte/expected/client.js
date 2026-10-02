import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<video></video>`, 2);
var root_1 = $.from_html(`<button>show/hide</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	let show = $.state(true);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var video = root();

			$.event('someevent', video, function (...$$args) {
				$$props.handler?.apply(this, $$args);
			});

			$.append($$anchor, video);
		};

		$.if(node, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.set(show, false));
	$.append($$anchor, fragment);
}

$.delegate(['click']);