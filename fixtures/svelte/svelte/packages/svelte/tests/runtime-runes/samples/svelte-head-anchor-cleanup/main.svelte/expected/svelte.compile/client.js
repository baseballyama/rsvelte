import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Head from './Head.svelte';

var root = $.from_html(`<button>toggle</button> <!>`, 1);

export default function Main($$anchor) {
	let show = $.state(false);
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			Head($$anchor, {});
		};

		$.if(node, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.set(show, !$.get(show)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);