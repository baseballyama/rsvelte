import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import List from "./List.svelte";

var root = $.from_html(`<!> <button>clear</button>`, 1);

export default function Main($$anchor) {
	let data = $.state($.proxy({ things: [{ id: 1 }, { id: 2 }] }));

	function reloadData() {
		$.set(data, null);
	}

	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => $.get(data).things.map((t) => t));

				List($$anchor, {
					get things() {
						return $.get($0);
					}
				});
			}
		};

		$.if(node, ($$render) => {
			if ($.get(data)) $$render(consequent);
		});
	}

	var button = $.sibling(node, 2);

	$.delegated('click', button, () => reloadData());
	$.append($$anchor, fragment);
}

$.delegate(['click']);