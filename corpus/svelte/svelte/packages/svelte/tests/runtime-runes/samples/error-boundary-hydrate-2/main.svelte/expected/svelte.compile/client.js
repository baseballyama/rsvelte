import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './child.svelte';

var root = $.from_html(`<p> </p> <button>reset</button>`, 1);
var root_1 = $.from_html(`<p>recovered</p>`);

export default function Main($$anchor) {
	let recovered = $.state(false);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const failed = ($$anchor, error = $.noop, reset = $.noop) => {
			var fragment_1 = root();
			var p = $.first_child(fragment_1);
			var text = $.only_child(p);
			var button = $.sibling(p, 2);

			$.template_effect(() => $.set_text(text, `failed: ${error() ?? ''}`));

			$.delegated('click', button, () => {
				$.set(recovered, true);
				reset()();
			});

			$.append($$anchor, fragment_1);
		};

		$.boundary(node, { failed }, ($$anchor) => {
			var fragment_2 = $.comment();
			var node_1 = $.first_child(fragment_2);

			{
				var consequent = ($$anchor) => {
					var p_1 = root_1();

					$.append($$anchor, p_1);
				};

				var alternate = ($$anchor) => {
					Child($$anchor, {});
				};

				$.if(node_1, ($$render) => {
					if ($.get(recovered)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_2);
		});
	}

	$.append($$anchor, fragment);
}

$.delegate(['click']);