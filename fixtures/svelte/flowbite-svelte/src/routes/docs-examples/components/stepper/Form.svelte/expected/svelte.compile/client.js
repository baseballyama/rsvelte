import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ProgressStepper, Label, Input, Button } from "flowbite-svelte";
import { HomeOutline, CartOutline, DollarOutline, TruckOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <form action="#"><h3 class="mb-4 text-lg leading-none font-medium text-gray-900 dark:text-white">Invoice details</h3> <div class="mb-4 grid gap-4 sm:grid-cols-2"><div><!> <!></div> <div><!> <!></div> <div><!> <!></div> <div><!> <!></div></div> <!></form>`, 1);

export default function Form($$anchor) {
	let current = $.state(2);

	const steps = [
		{
			id: 1,
			icon: HomeOutline,
			status: "completed", // Explicitly completed
			iconClass: "h-5 w-5 lg:h-6 lg:w-6"
		},

		{
			id: 2,
			icon: CartOutline,
			// status will be auto-determined based on current
			iconClass: "h-5 w-5 lg:h-6 lg:w-6"
		},

		{
			id: 3,
			icon: DollarOutline,
			// status will be auto-determined based on current
			iconClass: "h-5 w-5 lg:h-6 lg:w-6"
		},

		{
			id: 4,
			icon: TruckOutline,
			status: "pending", // Force pending regardless of current
			iconClass: "h-5 w-5 lg:h-6 lg:w-6"
		}
	];

	var fragment = root();
	var node = $.first_child(fragment);

	ProgressStepper(node, {
		get steps() {
			return steps;
		},
		class: 'mb-8',
		clickable: false,
		get current() {
			return $.get(current);
		},

		set current($$value) {
			$.set(current, $$value, true);
		}
	});

	var form = $.sibling(node, 2);
	var div = $.sibling($.child(form), 2);
	var div_1 = $.child(div);
	var node_1 = $.child(div_1);

	Label(node_1, {
		for: 'username',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Username');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Input(node_2, {
		type: 'text',
		name: 'username',
		id: 'username',
		placeholder: 'username.example',
		required: true
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_3 = $.child(div_2);

	Label(node_3, {
		for: 'email',
		class: 'mb-2 block text-sm font-medium text-gray-900 dark:text-white',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Email');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Input(node_4, {
		type: 'email',
		name: 'email',
		id: 'email',
		placeholder: 'name@company.com',
		required: true
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_5 = $.child(div_3);

	Label(node_5, {
		for: 'password',
		class: 'mb-2 block text-sm font-medium text-gray-900 dark:text-white',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Password');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Input(node_6, {
		type: 'password',
		name: 'password',
		id: 'password',
		placeholder: '•••••••••',
		required: true
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_7 = $.child(div_4);

	Label(node_7, {
		for: 'confirm-password',
		class: 'mb-2 block text-sm font-medium text-gray-900 dark:text-white',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Confirm password');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Input(node_8, {
		type: 'password',
		name: 'confirm-password',
		id: 'confirm-password',
		placeholder: '•••••••••',
		required: true
	});

	$.reset(div_4);
	$.reset(div);

	var node_9 = $.sibling(div, 2);

	Button(node_9, {
		type: 'submit',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Next Step: Payment Info');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.reset(form);
	$.append($$anchor, fragment);
}