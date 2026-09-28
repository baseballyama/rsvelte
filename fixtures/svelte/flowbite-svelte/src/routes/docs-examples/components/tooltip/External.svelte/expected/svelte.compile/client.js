import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip, Button } from "flowbite-svelte";

var root = $.from_html(`<div id="ext-ref" class="rounded-lg border border-gray-200 p-2 dark:border-gray-600">External reference</div> <div class="space-x-4 rtl:space-x-reverse"><!> <!> <!></div> <!>`, 1);

export default function External($$anchor) {
	let placement = "top";

	function onbeforetoggle(ev) {
		const trigger = ev.trigger;

		if (trigger?.id) {
			placement = trigger.id.replace("ref-", "");
		}
	}

	var fragment = root();
	var div = $.sibling($.first_child(fragment), 2);
	var node = $.child(div);

	Button(node, {
		id: 'ref-left',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Left');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		id: 'ref-top',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Top');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		id: 'ref-right',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Right');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_3 = $.sibling(div, 2);

	Tooltip(node_3, {
		reference: '#ext-ref',
		triggeredBy: '[id^=\'ref-\']',
		get placement() {
			return placement;
		},
		onbeforetoggle,
		class: 'w-64 text-sm font-light',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('And here\'s some amazing content. It\'s very engaging. Right?');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}