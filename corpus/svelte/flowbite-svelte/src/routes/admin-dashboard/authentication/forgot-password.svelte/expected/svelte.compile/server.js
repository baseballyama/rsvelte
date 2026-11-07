import * as $ from 'svelte/internal/server';
import { ForgotPassword } from "flowbite-svelte-admin-dashboard";
import { Label, Input, Checkbox, A } from "flowbite-svelte";
import MetaTag from "../utils/MetaTag.svelte";

export default function Forgot_password($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const onSubmit = (e) => {
			const formData = new FormData(e.target);
			const data = {};

			for (const field of formData.entries()) {
				const [key, value] = field;

				data[key] = value;
			}

			console.log(data);
		};

		const path = "/authentication/forgot-password";
		const description = "Forgot password example - Flowbite Svelte Admin Dashboard";
		const title = "Flowbite Svelte Admin Dashboard - Forgot password";
		const subtitle = "Forgot password";

		MetaTag($$renderer, { path, description, title, subtitle });
		$$renderer.push(`<!----> `);

		ForgotPassword($$renderer, {
			onsubmit: onSubmit,
			children: ($$renderer) => {
				$$renderer.push(`<div>`);

				Label($$renderer, {
					for: 'email',
					class: 'mb-2',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Your email`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Input($$renderer, {
					type: 'email',
					name: 'email',
					id: 'email',
					placeholder: 'name@company.com',
					required: true,
					class: 'border outline-none'
				});

				$$renderer.push(`<!----></div> `);

				Checkbox($$renderer, {
					class: 'gap-1',
					children: ($$renderer) => {
						$$renderer.push(`<!---->I accept the `);

						A($$renderer, {
							href: '/',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Terms and Conditions`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}