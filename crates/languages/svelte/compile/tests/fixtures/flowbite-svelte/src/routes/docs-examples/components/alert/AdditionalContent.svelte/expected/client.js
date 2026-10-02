import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Alert, Button } from "flowbite-svelte";
import { InfoCircleSolid, EyeSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!>View more`, 1);
var root_1 = $.from_html(`<div class="flex items-center gap-3"><!> <span class="text-lg font-medium">This is a info alert</span></div> <p class="mt-2 mb-4 text-sm">More info about this info alert goes here. This example text is going to run a bit longer so that you can see how spacing within an alert works with this kind of content.</p> <div class="flex gap-2"><!> <!></div>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function AdditionalContent($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	Alert(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var node_1 = $.child(div);

			InfoCircleSolid(node_1, { class: 'h-5 w-5' });
			$.next(2);
			$.reset(div);

			var div_1 = $.sibling(div, 4);
			var node_2 = $.child(div_1);

			Button(node_2, {
				size: 'xs',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					EyeSolid(node_3, { class: 'me-2 h-4 w-4' });
					$.next();
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_2, 2);

			Button(node_4, {
				size: 'xs',
				outline: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Go to Home');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node, 2);

	Alert(node_5, {
		color: 'green',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_1();
			var div_2 = $.first_child(fragment_3);
			var node_6 = $.child(div_2);

			InfoCircleSolid(node_6, { class: 'h-5 w-5' });
			$.next(2);
			$.reset(div_2);

			var div_3 = $.sibling(div_2, 4);
			var node_7 = $.child(div_3);

			Button(node_7, {
				size: 'xs',
				color: 'green',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_8 = $.first_child(fragment_4);

					EyeSolid(node_8, { class: 'me-2 h-4 w-4' });
					$.next();
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_7, 2);

			Button(node_9, {
				size: 'xs',
				outline: true,
				color: 'green',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Go to Home');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}