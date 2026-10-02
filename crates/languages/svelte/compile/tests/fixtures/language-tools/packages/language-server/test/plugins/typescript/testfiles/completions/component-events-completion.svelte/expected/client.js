import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CEI from './component-events-interface.svelte';
import CED from './component-events-event-dispatcher.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Component_events_completion($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	CEI(node, {
		foo: '',
		$$events: {
			a: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	CED(node_1, { on: true });
	$.append($$anchor, fragment);
}