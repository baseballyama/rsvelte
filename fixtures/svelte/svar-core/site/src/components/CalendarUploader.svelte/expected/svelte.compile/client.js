import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Calendar } from "@svar-ui/svelte-core";

var root = $.from_html(`<div class="column svelte-1cpnak4"><!> <!></div>`);

export default function CalendarUploader($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.child(div);

	Calendar(node, { value: new Date(), buttons: false });

	var node_1 = $.sibling(node, 2);

	Calendar(node_1, {
		value: new Date(),
		current: new Date(new Date() * 1 + 3600 * 1000 * 24 * 32)
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}