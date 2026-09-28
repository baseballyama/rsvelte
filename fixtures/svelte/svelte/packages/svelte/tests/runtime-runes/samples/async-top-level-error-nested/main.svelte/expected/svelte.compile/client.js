import 'svelte/internal/disclose-version';
import Child from './Child.svelte';
import * as $ from 'svelte/internal/client';

export let route = $.proxy({});

var root = $.from_html(`<p>pending</p>`);
var root_1 = $.from_html(`<p>failed</p>`);
var root_2 = $.from_html(`<button>reject</button> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root_2();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		const pending = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		const failed = ($$anchor) => {
			var p_1 = root_1();

			$.append($$anchor, p_1);
		};

		$.boundary(node, { pending, failed }, ($$anchor) => {
			Child($$anchor, {});
		});
	}

	$.delegated('click', button, () => route.reject());
	$.append($$anchor, fragment);
}

$.delegate(['click']);