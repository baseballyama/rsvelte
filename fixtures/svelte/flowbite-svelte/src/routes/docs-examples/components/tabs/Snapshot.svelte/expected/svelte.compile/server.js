import * as $ from 'svelte/internal/server';
import { Tabs, TabItem, Label, Button, Input, Textarea, A } from "flowbite-svelte";

export default function Snapshot($$renderer, $$props) {
	let name = "";
	let email = "";
	let comment = "";

	const snapshot = {
		capture: () => ({ name, email, comment }),
		restore: (value) => {
			name = value.name;
			email = value.email;
			comment = value.comment;
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		alert(`Submitted:\nName: ${name}\nEmail: ${email}\nComment: ${comment}`);
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		A($$renderer, {
			href: '/',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Go home`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Tabs($$renderer, {
			role: 'tablist',
			children: ($$renderer) => {
				TabItem($$renderer, {
					open: true,
					title: 'Profile',
					children: ($$renderer) => {
						$$renderer.push(`<form method="POST">`);

						Label($$renderer, {
							for: 'name',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Name`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Input($$renderer, {
							id: 'name',
							type: 'text',
							get value() {
								return name;
							},

							set value($$value) {
								name = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> <label for="email">Email</label> `);

						Input($$renderer, {
							id: 'email',
							type: 'email',
							get value() {
								return email;
							},

							set value($$value) {
								email = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> <label for="comment">Comment</label> `);

						Textarea($$renderer, {
							id: 'comment',
							class: 'w-full',
							get value() {
								return comment;
							},

							set value($$value) {
								comment = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							onclick: handleSubmit,
							class: 'mt-4',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Submit`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></form>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				TabItem($$renderer, {
					title: 'Settings',
					children: ($$renderer) => {
						$$renderer.push(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Settings:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
	$.bind_props($$props, { snapshot });
}