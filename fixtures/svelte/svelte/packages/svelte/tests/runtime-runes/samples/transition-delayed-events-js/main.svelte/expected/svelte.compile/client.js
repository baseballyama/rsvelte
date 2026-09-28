import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>delayed fade</p>`);
var root_1 = $.from_html(`<button>toggle</button> <!>`, 1);

export default function Main($$anchor) {
	function fade(node) {
		return {
			delay: 100,
			duration: 100,
			tick: (t) => node.style.opacity = t
		};
	}

	let visible = $.state(false);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node_1 = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.event('introstart', p, () => console.log('introstart'));
			$.event('introend', p, () => console.log('introend'));
			$.event('outrostart', p, () => console.log('outrostart'));
			$.event('outroend', p, () => console.log('outroend'));
			$.transition(3, p, () => fade);
			$.append($$anchor, p);
		};

		$.if(node_1, ($$render) => {
			if ($.get(visible)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.set(visible, !$.get(visible)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);