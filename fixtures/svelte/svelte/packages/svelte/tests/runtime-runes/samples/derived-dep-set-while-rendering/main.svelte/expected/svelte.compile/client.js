import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from "./Child.svelte";
import { store } from "./store.svelte.js";

var root = $.from_html(`<!> <div>visible</div>`, 1);
var root_1 = $.from_html(`<button>show</button> <button>hide</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const visible = $.derived(() => store.get("visible"));
	const visible2 = $.derived(() => $.get(visible));
	var fragment = root_1();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Child(node_1, {});
			$.next(2);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(visible2)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => store.set("visible", true));
	$.delegated('click', button_1, () => store.set("visible", false));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);