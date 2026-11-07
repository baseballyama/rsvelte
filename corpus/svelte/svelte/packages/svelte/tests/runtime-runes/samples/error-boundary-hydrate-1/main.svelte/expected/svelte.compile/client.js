import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './child.svelte';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<p>recovered</p>`);
var root_2 = $.from_html(`<!> <button>reset</button>`, 1);

export default function Main($$anchor) {
	let recovered = $.state(false);
	let reset_fn = $.state(void 0);
	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		const failed = ($$anchor, error = $.noop) => {
			var p = root();
			var text = $.only_child(p);

			$.template_effect(() => $.set_text(text, `failed: ${error() ?? ''}`));
			$.append($$anchor, p);
		};

		$.boundary(
			node,
			{
				onerror: (error, reset) => {
					console.log(`onerror: ${error}`);
					$.set(reset_fn, reset, true);
				},
				failed
			},
			($$anchor) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

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

				$.append($$anchor, fragment_1);
			}
		);
	}

	var button = $.sibling(node, 2);

	$.delegated('click', button, () => {
		$.set(recovered, true);
		$.get(reset_fn)();
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);