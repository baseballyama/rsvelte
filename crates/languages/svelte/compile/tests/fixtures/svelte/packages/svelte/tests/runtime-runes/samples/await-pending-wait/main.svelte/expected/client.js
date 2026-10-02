import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Await from './await.svelte';

var root = $.from_html(`<button>Clear</button> <button>Immediate</button> <button>Takes time</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let promise = $.state(void 0);
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var node = $.sibling(button_2, 2);

	{
		var consequent = ($$anchor) => {
			Await($$anchor, {
				get promise() {
					return $.get(promise);
				}
			});
		};

		$.if(node, ($$render) => {
			if ($.get(promise)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.set(promise, null));
	$.delegated('click', button_1, () => $.set(promise, Promise.resolve(), true));
	$.delegated('click', button_2, () => $.set(promise, new Promise((r) => setTimeout(r, 100)), true));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);