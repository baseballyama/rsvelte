import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Seo from './Seo.svelte';

var root = $.from_html(`<button>toggle</button> <!>`, 1);

export default function Main($$anchor) {
	let post = $.state(null);

	function toggle() {
		$.set(post, $.get(post) ? null : { title: 'hello world' }, true);
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			Seo($$anchor, {
				get post() {
					return $.get(post);
				}
			});
		};

		$.if(node, ($$render) => {
			if ($.get(post)) $$render(consequent);
		});
	}

	$.delegated('click', button, toggle);
	$.append($$anchor, fragment);
}

$.delegate(['click']);