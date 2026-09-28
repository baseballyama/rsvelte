import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inner from './Inner.svelte';

var root = $.from_html(`<button>toggle</button> <button>resolve</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let deferred = [];
	let show = $.state(false);
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 2);

	{
		var consequent = ($$anchor) => {
			Inner($$anchor, {
				get deferred() {
					return deferred;
				}
			});
		};

		$.if(node, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.set(show, !$.get(show)));
	$.delegated('click', button_1, () => deferred.pop()());
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);