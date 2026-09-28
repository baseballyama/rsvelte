import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Trigger from './Trigger.svelte';

var root = $.from_html(`<p>caught</p>`);
var root_1 = $.from_html(`<button>break</button> <button>unmount</button> <!>`, 1);

export default function Main($$anchor) {
	let mounted = $.state(true);
	let broken = $.state(false);

	// Throwing derived — nothing in the live template reads `appContext`, so
	// invalidating it does NOT throw immediately (becomes dirty-and-unread).
	let data = $.derived(() => $.get(broken) ? null : { value: 'ok' });

	let appContext = $.derived(() => $.get(data).value);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const failed = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.boundary(node, { failed }, ($$anchor) => {
			var fragment_1 = root_1();
			var button = $.first_child(fragment_1);
			var button_1 = $.sibling(button, 2);
			var node_1 = $.sibling(button_1, 2);

			{
				var consequent = ($$anchor) => {
					Trigger($$anchor, { getValue: () => $.get(appContext) });
				};

				$.if(node_1, ($$render) => {
					if ($.get(mounted)) $$render(consequent);
				});
			}

			$.delegated('click', button, () => $.set(broken, true));
			$.delegated('click', button_1, () => $.set(mounted, false));
			$.append($$anchor, fragment_1);
		});
	}

	$.append($$anchor, fragment);
}

$.delegate(['click']);