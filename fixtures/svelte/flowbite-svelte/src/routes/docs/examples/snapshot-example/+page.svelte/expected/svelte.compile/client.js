import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input, Label, Button, Checkbox, A, Heading } from "$lib";

var root = $.from_html(`I agree with the <!>.`, 1);
var root_1 = $.from_html(`<!> <form class="p-16"><div class="mb-6 grid gap-6 md:grid-cols-2"><div><!> <!></div> <div><!> <!></div> <div><!> <!></div> <div><!> <!></div></div> <div class="mb-6"><!> <!></div> <div class="mb-6"><!> <!></div> <div class="mb-6"><!> <!></div> <!> <!></form>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let formData = $.proxy({
		first_name: "",
		last_name: "",
		company: "",
		website: "",
		email: ""
	});

	const snapshot = {
		capture: () => ({ ...formData }),
		restore: (value) => Object.assign(formData, value)
	};

	var $$exports = { snapshot };
	var fragment = root_1();
	var node = $.first_child(fragment);

	Heading(node, {
		tag: 'h1',
		class: 'mt-8 ml-16 text-4xl',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Snapshot Example');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var form = $.sibling(node, 2);
	var div = $.child(form);
	var div_1 = $.child(div);
	var node_1 = $.child(div_1);

	Label(node_1, {
		for: 'first_name',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('First name');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Input(node_2, {
		type: 'text',
		id: 'first_name',
		placeholder: 'John',
		required: true,
		get value() {
			return formData.first_name;
		},

		set value($$value) {
			formData.first_name = $$value;
		}
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_3 = $.child(div_2);

	Label(node_3, {
		for: 'last_name',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Last name');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Input(node_4, {
		type: 'text',
		id: 'last_name',
		placeholder: 'Doe',
		required: true,
		get value() {
			return formData.last_name;
		},

		set value($$value) {
			formData.last_name = $$value;
		}
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_5 = $.child(div_3);

	Label(node_5, {
		for: 'company',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Company');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Input(node_6, {
		type: 'text',
		id: 'company',
		placeholder: 'Flowbite',
		required: true,
		get value() {
			return formData.company;
		},

		set value($$value) {
			formData.company = $$value;
		}
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_7 = $.child(div_4);

	Label(node_7, {
		for: 'website',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Website URL');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Input(node_8, {
		type: 'url',
		id: 'website',
		placeholder: 'flowbite.com',
		get value() {
			return formData.website;
		},

		set value($$value) {
			formData.website = $$value;
		}
	});

	$.reset(div_4);
	$.reset(div);

	var div_5 = $.sibling(div, 2);
	var node_9 = $.child(div_5);

	Label(node_9, {
		for: 'email',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Email address');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	Input(node_10, {
		type: 'email',
		id: 'email',
		placeholder: 'john.doe@company.com',
		required: true,
		get value() {
			return formData.email;
		},

		set value($$value) {
			formData.email = $$value;
		}
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_11 = $.child(div_6);

	Label(node_11, {
		for: 'password',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Password');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 2);

	Input(node_12, { type: 'password', id: 'password', placeholder: '•••••••••' });
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_13 = $.child(div_7);

	Label(node_13, {
		for: 'confirm_password',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Confirm password');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_13, 2);

	Input(node_14, {
		type: 'password',
		id: 'confirm_password',
		placeholder: '•••••••••'
	});

	$.reset(div_7);

	var node_15 = $.sibling(div_7, 2);

	Checkbox(node_15, {
		classes: { div: "mb-6 space-x-1 rtl:space-x-reverse" },
		required: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node_16 = $.sibling($.first_child(fragment_1));

			A(node_16, {
				href: '/',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('terms and conditions');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_17 = $.sibling(node_15, 2);

	Button(node_17, {
		type: 'submit',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('Submit');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	$.reset(form);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}