import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<p>error escaped containment</p>`);
var root_1 = $.from_html(`<p>loading…</p>`);
var root_2 = $.from_html(`<p>error was contained</p>`);
var root_3 = $.from_html(`<button>show</button> <!>`, 1);

export default function Main($$anchor) {
	let open = $.state(false);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const failed = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.boundary(node, { failed }, ($$anchor) => {
			var fragment_1 = root_3();
			var button = $.first_child(fragment_1);
			var node_1 = $.sibling(button, 2);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					{
						const pending = ($$anchor) => {
							var p_1 = root_1();

							$.append($$anchor, p_1);
						};

						const failed = ($$anchor) => {
							var p_2 = root_2();

							$.append($$anchor, p_2);
						};

						$.boundary(node_2, { pending, failed }, ($$anchor) => {
							Child($$anchor, {});
						});
					}

					$.append($$anchor, fragment_2);
				};

				$.if(node_1, ($$render) => {
					if ($.get(open)) $$render(consequent);
				});
			}

			$.delegated('click', button, () => $.set(open, true));
			$.append($$anchor, fragment_1);
		});
	}

	$.append($$anchor, fragment);
}

$.delegate(['click']);