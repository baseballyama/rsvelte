import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover, Button } from "flowbite-svelte";

var root = $.from_html(`<!> <div class="space-x-4 rtl:space-x-reverse"><!> <!></div> <!> <!>`, 1);

export default function Placement($$anchor) {
	let placement = $.state("bottom");

	function onbeforetoggle(ev) {
		const trigger = ev.trigger;

		if (trigger?.id) {
			$.set(placement, trigger.id.replace("placement-", ""), true);
		}
	}

	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		id: 'placement-top',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Top popover');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Button(node_1, {
		id: 'placement-left',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Left popover');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		id: 'placement-right',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Right popover');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_3 = $.sibling(div, 2);

	Button(node_3, {
		id: 'placement-bottom',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Bottom popover');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Popover(node_4, {
		triggeredBy: '[id^=\'placement-\']',
		get placement() {
			return $.get(placement);
		},
		class: 'w-64 text-sm font-light ',
		get title() {
			return `Popover ${$.get(placement) ?? ''}`;
		},
		onbeforetoggle,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('And here\'s some amazing content. It\'s very engaging. Right?');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}