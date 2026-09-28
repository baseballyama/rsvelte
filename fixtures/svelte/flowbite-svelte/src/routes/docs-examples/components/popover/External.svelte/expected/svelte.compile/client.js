import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover, Button } from "flowbite-svelte";

var root = $.from_html(`<div id="ext-ref" class="my-4 rounded-lg border border-gray-200 p-2 dark:border-gray-600">External reference</div> <div class="space-x-4 rtl:space-x-reverse"><!> <!> <!></div> <!> <!> <!>`, 1);

export default function External($$anchor) {
	var fragment = root();
	var div = $.sibling($.first_child(fragment), 2);
	var node = $.child(div);

	Button(node, {
		id: 'ref-1',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Left');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		id: 'ref-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Top');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		id: 'ref-3',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Right');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_3 = $.sibling(div, 2);

	Popover(node_3, {
		reference: '#ext-ref',
		triggeredBy: '#ref-1',
		class: 'w-64 text-sm font-light ',
		placement: 'left',
		title: 'Placement: Left',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('And here\'s some amazing content. It\'s very engaging. Right?');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Popover(node_4, {
		reference: '#ext-ref',
		triggeredBy: '#ref-2',
		class: 'w-64 text-sm font-light ',
		placement: 'top',
		title: 'Placement: Top',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('And here\'s some amazing content. It\'s very engaging. Right?');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Popover(node_5, {
		reference: '#ext-ref',
		triggeredBy: '#ref-3',
		class: 'w-64 text-sm font-light ',
		placement: 'right',
		title: 'Placement: Right',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('And here\'s some amazing content. It\'s very engaging. Right?');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}