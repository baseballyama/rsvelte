import * as $ from 'svelte/internal/server';
import { Input, Label, Button, Checkbox, A } from "flowbite-svelte";

export default function Default($$renderer) {
	$$renderer.push(`<form><div class="mb-6 grid gap-6 md:grid-cols-2"><div>`);

	Label($$renderer, {
		for: 'first_name',
		class: 'mb-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->First name`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Input($$renderer, {
		type: 'text',
		id: 'first_name',
		placeholder: 'John',
		required: true
	});

	$$renderer.push(`<!----></div> <div>`);

	Label($$renderer, {
		for: 'last_name',
		class: 'mb-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Last name`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Input($$renderer, {
		type: 'text',
		id: 'last_name',
		placeholder: 'Doe',
		required: true
	});

	$$renderer.push(`<!----></div> <div>`);

	Label($$renderer, {
		for: 'company',
		class: 'mb-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Company`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Input($$renderer, {
		type: 'text',
		id: 'company',
		placeholder: 'Flowbite',
		required: true
	});

	$$renderer.push(`<!----></div> <div>`);

	Label($$renderer, {
		for: 'phone',
		class: 'mb-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Phone number`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Input($$renderer, {
		type: 'tel',
		id: 'phone',
		placeholder: '123-45-678',
		pattern: "[0-9]{3}-[0-9]{2}-[0-9]{3}",
		required: true
	});

	$$renderer.push(`<!----></div> <div>`);

	Label($$renderer, {
		for: 'website',
		class: 'mb-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Website URL`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Input($$renderer, {
		type: 'url',
		id: 'website',
		placeholder: 'flowbite.com',
		required: true
	});

	$$renderer.push(`<!----></div> <div>`);

	Label($$renderer, {
		for: 'visitors',
		class: 'mb-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Unique visitors (per month)`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Input($$renderer, {
		type: 'number',
		id: 'visitors',
		placeholder: '',
		required: true
	});

	$$renderer.push(`<!----></div></div> <div class="mb-6">`);

	Label($$renderer, {
		for: 'email',
		class: 'mb-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Email address`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Input($$renderer, {
		type: 'email',
		id: 'email',
		placeholder: 'john.doe@company.com',
		required: true
	});

	$$renderer.push(`<!----></div> <div class="mb-6">`);

	Label($$renderer, {
		for: 'password',
		class: 'mb-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Password`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Input($$renderer, {
		type: 'password',
		id: 'password',
		placeholder: '•••••••••',
		required: true
	});

	$$renderer.push(`<!----></div> <div class="mb-6">`);

	Label($$renderer, {
		for: 'confirm_password',
		class: 'mb-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Confirm password`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Input($$renderer, {
		type: 'password',
		id: 'confirm_password',
		placeholder: '•••••••••',
		required: true
	});

	$$renderer.push(`<!----></div> `);

	Checkbox($$renderer, {
		classes: { div: "mb-6 gap-1 rtl:space-x-reverse" },
		required: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->I agree with the `);

			A($$renderer, {
				href: '/',
				class: 'text-primary-700 dark:text-primary-600 hover:underline',
				children: ($$renderer) => {
					$$renderer.push(`<!---->terms and conditions`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		type: 'submit',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Submit`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></form>`);
}