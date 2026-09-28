import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inner from './Inner.svelte';

var root = $.from_html(`<p>pending</p>`);
var root_1 = $.from_html(`<button>toggle</button> <!>`, 1);

export default function Main($$anchor) {
	let show = $.state(true);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const pending = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.boundary(node, { pending }, ($$anchor) => {
			var fragment_1 = root_1();
			var button = $.first_child(fragment_1);
			var node_1 = $.sibling(button, 2);

			{
				var consequent = ($$anchor) => {
					Inner($$anchor, {});
				};

				$.if(node_1, ($$render) => {
					if ($.get(show)) $$render(consequent);
				});
			}

			$.delegated('click', button, () => $.set(show, !$.get(show)));
			$.append($$anchor, fragment_1);
		});
	}

	$.append($$anchor, fragment);
}

$.delegate(['click']);