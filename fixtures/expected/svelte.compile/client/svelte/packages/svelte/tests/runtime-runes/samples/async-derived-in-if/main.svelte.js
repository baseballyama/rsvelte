import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<p>pending</p>`);
var root_1 = $.from_html(`<button>show</button> <!>`, 1);

export default function Main($$anchor) {
	let show = $.state(false);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		const pending = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.boundary(node, { pending }, ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					Child($$anchor, {});
				};

				$.if(node_1, ($$render) => {
					if ($.get(show)) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		});
	}

	$.delegated('click', button, () => $.set(show, true));
	$.append($$anchor, fragment);
}

$.delegate(['click']);