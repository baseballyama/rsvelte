import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Foo from './Foo.svelte';

export let resolve = [];

var root = $.from_html(`<p>initializing...</p>`);
var root_1 = $.from_html(`<p>pending...</p>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<button>show</button> <button>resolve</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let show = $.state(false);
	var fragment = root_3();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 2);

	{
		const pending = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.boundary(node, { pending }, ($$anchor) => {
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					Foo($$anchor, {});
				};

				$.if(node_1, ($$render) => {
					if ($.get(show)) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					var p_1 = root_1();

					$.append($$anchor, p_1);
				};

				$.if(node_2, ($$render) => {
					if ($.eager($.pending)) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment_1);
		});
	}

	$.delegated('click', button, () => $.set(show, true));
	$.delegated('click', button_1, () => resolve.shift()());
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);