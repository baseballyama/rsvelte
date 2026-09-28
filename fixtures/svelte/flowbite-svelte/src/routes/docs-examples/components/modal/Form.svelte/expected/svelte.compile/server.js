import * as $ from 'svelte/internal/server';
import { Button, Modal, Label, Input, Checkbox } from "flowbite-svelte";

export default function Form($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let formModal = false;
		let error = "";

		function onaction({ action, data }) {
			error = "";

			// Check the data validity, return false to prevent dialog closing; anything else to proceed
			if (action === "login" && data.get("password")?.length < 4) {
				error = "Password must have at least 4 characters";

				return false;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Button($$renderer, {
				onclick: () => formModal = true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Form modal`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Modal($$renderer, {
				form: true,
				size: 'xs',
				onaction,
				get open() {
					return formModal;
				},

				set open($$value) {
					formModal = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-col space-y-6"><h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Sign in to our platform</h3> `);

					if (error) {
						$$renderer.push('<!--[0-->');

						Label($$renderer, {
							color: 'red',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(error)}`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					Label($$renderer, {
						class: 'space-y-2',
						children: ($$renderer) => {
							$$renderer.push(`<span>Email</span> `);

							Input($$renderer, {
								type: 'email',
								name: 'email',
								placeholder: 'name@company.com',
								required: true
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Label($$renderer, {
						class: 'space-y-2',
						children: ($$renderer) => {
							$$renderer.push(`<span>Your password</span> `);

							Input($$renderer, {
								type: 'password',
								name: 'password',
								placeholder: 'min. 4 characters',
								required: true
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <div class="flex items-start">`);

					Checkbox($$renderer, {
						name: 'remember',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Remember me`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <a href="/" class="text-primary-700 dark:text-primary-500 ms-auto text-sm hover:underline">Lost password?</a></div> `);

					Button($$renderer, {
						type: 'submit',
						value: 'login',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Login to your account`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <div class="text-sm font-medium text-gray-500 dark:text-gray-300">Not registered? <a href="/" class="text-primary-700 dark:text-primary-500 hover:underline">Create account</a></div></div>`);
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
	});
}