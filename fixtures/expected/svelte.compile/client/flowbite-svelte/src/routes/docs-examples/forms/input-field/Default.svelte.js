import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input, Label, Button, Checkbox, A } from "flowbite-svelte";

var root = $.from_html(`I agree with the <!>.`, 1);
var root_1 = $.from_html(`<form><div class="mb-6 grid gap-6 md:grid-cols-2"><div><!> <!></div> <div><!> <!></div> <div><!> <!></div> <div><!> <!></div> <div><!> <!></div> <div><!> <!></div></div> <div class="mb-6"><!> <!></div> <div class="mb-6"><!> <!></div> <div class="mb-6"><!> <!></div> <!> <!></form>`);

export default function Default($$anchor) {
	var form = root_1();
	var div = $.child(form);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Label(node, {
		for: 'first_name',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('First name');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Input(node_1, {
		type: 'text',
		id: 'first_name',
		placeholder: 'John',
		required: true
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	Label(node_2, {
		for: 'last_name',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Last name');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Input(node_3, {
		type: 'text',
		id: 'last_name',
		placeholder: 'Doe',
		required: true
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_4 = $.child(div_3);

	Label(node_4, {
		for: 'company',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Company');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Input(node_5, {
		type: 'text',
		id: 'company',
		placeholder: 'Flowbite',
		required: true
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_6 = $.child(div_4);

	Label(node_6, {
		for: 'phone',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Phone number');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Input(node_7, {
		type: 'tel',
		id: 'phone',
		placeholder: '123-45-678',
		pattern: "[0-9]{3}-[0-9]{2}-[0-9]{3}",
		required: true
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_8 = $.child(div_5);

	Label(node_8, {
		for: 'website',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Website URL');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Input(node_9, {
		type: 'url',
		id: 'website',
		placeholder: 'flowbite.com',
		required: true
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_10 = $.child(div_6);

	Label(node_10, {
		for: 'visitors',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Unique visitors (per month)');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	Input(node_11, {
		type: 'number',
		id: 'visitors',
		placeholder: '',
		required: true
	});

	$.reset(div_6);
	$.reset(div);

	var div_7 = $.sibling(div, 2);
	var node_12 = $.child(div_7);

	Label(node_12, {
		for: 'email',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Email address');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 2);

	Input(node_13, {
		type: 'email',
		id: 'email',
		placeholder: 'john.doe@company.com',
		required: true
	});

	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var node_14 = $.child(div_8);

	Label(node_14, {
		for: 'password',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Password');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_14, 2);

	Input(node_15, {
		type: 'password',
		id: 'password',
		placeholder: '•••••••••',
		required: true
	});

	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var node_16 = $.child(div_9);

	Label(node_16, {
		for: 'confirm_password',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('Confirm password');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	var node_17 = $.sibling(node_16, 2);

	Input(node_17, {
		type: 'password',
		id: 'confirm_password',
		placeholder: '•••••••••',
		required: true
	});

	$.reset(div_9);

	var node_18 = $.sibling(div_9, 2);

	Checkbox(node_18, {
		classes: { div: "mb-6 gap-1 rtl:space-x-reverse" },
		required: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment = root();
			var node_19 = $.sibling($.first_child(fragment));

			A(node_19, {
				href: '/',
				class: 'text-primary-700 dark:text-primary-600 hover:underline',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_9 = $.text('terms and conditions');

					$.append($$anchor, text_9);
				},
				$$slots: { default: true }
			});

			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_20 = $.sibling(node_18, 2);

	Button(node_20, {
		type: 'submit',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('Submit');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	$.reset(form);
	$.append($$anchor, form);
}