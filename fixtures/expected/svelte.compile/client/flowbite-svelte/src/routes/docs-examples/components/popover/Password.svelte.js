import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover, Label, Input, Checkbox, Button } from "flowbite-svelte";
import { CheckOutline, CloseOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<h3 class="font-semibold text-gray-900 dark:text-white">Must have at least 6 characters</h3> <div class="grid grid-cols-4 gap-2"><div class="h-1 bg-orange-300 dark:bg-orange-400"></div> <div class="h-1 bg-orange-300 dark:bg-orange-400"></div> <div class="h-1 bg-gray-200 dark:bg-gray-600"></div> <div class="h-1 bg-gray-200 dark:bg-gray-600"></div></div> <p class="py-2">It’s better to have:</p> <ul><li class="mb-1 flex items-center"><!> Upper &amp; lower case letters</li> <li class="mb-1 flex items-center"><!> A symbol (#$&amp;)</li> <li class="flex items-center"><!>A longer password (min. 12 chars.)</li></ul>`, 1);
var root_1 = $.from_html(`<form class="mb-8"><div class="mb-6"><!> <!></div> <div class="mb-6"><!> <!></div> <!> <!></form> <!>`, 1);

export default function Password($$anchor) {
	const preventDefault = (fn) => {
		return function (event) {
			event.preventDefault();
			fn.call(this, event);
		};
	};

	const handler = () => {
		alert("Submitted!");
	};

	var fragment = root_1();
	var form = $.first_child(fragment);
	var event_handler = $.derived(() => preventDefault(handler));
	var div = $.child(form);
	var node = $.child(div);

	Label(node, {
		for: 'email',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Your email');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Input(node_1, { type: 'email', id: 'email', placeholder: 'name@flowbite.com' });
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_2 = $.child(div_1);

	Label(node_2, {
		for: 'password',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Your password');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Input(node_3, { type: 'password', id: 'password' });
	$.reset(div_1);

	var node_4 = $.sibling(div_1, 2);

	Checkbox(node_4, {
		classes: { div: "mb-6" },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Remember me');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Button(node_5, {
		type: 'submit',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Submit');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(form);

	var node_6 = $.sibling(form, 2);

	Popover(node_6, {
		class: 'text-sm',
		triggeredBy: '#password',
		placement: 'bottom',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var ul = $.sibling($.first_child(fragment_1), 6);
			var li = $.child(ul);
			var node_7 = $.child(li);

			CheckOutline(node_7, { class: 'me-2 h-4 w-4 text-green-400 dark:text-green-500' });
			$.next();
			$.reset(li);

			var li_1 = $.sibling(li, 2);
			var node_8 = $.child(li_1);

			CheckOutline(node_8, { class: 'me-2 h-4 w-4 text-green-400 dark:text-green-500' });
			$.next();
			$.reset(li_1);

			var li_2 = $.sibling(li_1, 2);
			var node_9 = $.child(li_2);

			CloseOutline(node_9, { class: 'me-2 h-4 w-4 text-gray-300 dark:text-gray-400' });
			$.next();
			$.reset(li_2);
			$.reset(ul);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.event('submit', form, function (...$$args) {
		$.get(event_handler)?.apply(this, $$args);
	});

	$.append($$anchor, fragment);
}