import * as $ from 'svelte/internal/server';
import { Input, Label, Button, Checkbox, A, Heading } from "$lib";

export default function _page($$renderer, $$props) {
	let formData = {
		first_name: "",
		last_name: "",
		company: "",
		website: "",
		email: ""
	};

	const snapshot = {
		capture: () => ({ ...formData }),
		restore: (value) => Object.assign(formData, value)
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Heading($$renderer, {
			tag: 'h1',
			class: 'mt-8 ml-16 text-4xl',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Snapshot Example`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <form class="p-16"><div class="mb-6 grid gap-6 md:grid-cols-2"><div>`);

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
			required: true,
			get value() {
				return formData.first_name;
			},

			set value($$value) {
				formData.first_name = $$value;
				$$settled = false;
			}
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
			required: true,
			get value() {
				return formData.last_name;
			},

			set value($$value) {
				formData.last_name = $$value;
				$$settled = false;
			}
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
			required: true,
			get value() {
				return formData.company;
			},

			set value($$value) {
				formData.company = $$value;
				$$settled = false;
			}
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
			get value() {
				return formData.website;
			},

			set value($$value) {
				formData.website = $$value;
				$$settled = false;
			}
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
			required: true,
			get value() {
				return formData.email;
			},

			set value($$value) {
				formData.email = $$value;
				$$settled = false;
			}
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
		Input($$renderer, { type: 'password', id: 'password', placeholder: '•••••••••' });
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
			placeholder: '•••••••••'
		});

		$$renderer.push(`<!----></div> `);

		Checkbox($$renderer, {
			classes: { div: "mb-6 space-x-1 rtl:space-x-reverse" },
			required: true,
			children: ($$renderer) => {
				$$renderer.push(`<!---->I agree with the `);

				A($$renderer, {
					href: '/',
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

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
	$.bind_props($$props, { snapshot });
}