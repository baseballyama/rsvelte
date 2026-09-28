import * as $ from 'svelte/internal/server';
import { Label, Input } from "flowbite-svelte";
import { SignUp } from "flowbite-svelte-admin-dashboard";
import MetaTag from "../utils/MetaTag.svelte";

export default function Sign_up($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const title = "Create a Free Account";

		const site = {
			name: "Flowbite",
			img: "/images/flowbite-svelte-icon-logo.svg",
			link: "/",
			imgAlt: "FlowBite Logo"
		};

		const acceptTerms = true;
		const haveAccount = true;
		const btnTitle = "Create account";
		const termsLink = "/";
		const loginLink = "sign-in";
		const labelClass = "space-y-2 dark:text-white";

		const onSubmit = (e) => {
			const formData = new FormData(e.target);
			const data = {};

			for (const field of formData.entries()) {
				const [key, value] = field;

				data[key] = value;
			}

			console.log(data);
		};

		const path = "/authentication/sign-up";
		const description = "Sign up example - Flowbite Svelte Admin Dashboard";
		const metaTitle = "Flowbite Svelte Admin Dashboard - Sign up";
		const subtitle = "Sign up";

		MetaTag($$renderer, { path, description, title: metaTitle, subtitle });
		$$renderer.push(`<!----> `);

		SignUp($$renderer, {
			title,
			site,
			acceptTerms,
			haveAccount,
			btnTitle,
			termsLink,
			loginLink,
			onsubmit: onSubmit,
			children: ($$renderer) => {
				$$renderer.push(`<div>`);

				Label($$renderer, {
					class: labelClass,
					children: ($$renderer) => {
						$$renderer.push(`<span>Your email</span> `);

						Input($$renderer, {
							type: 'email',
							name: 'email',
							placeholder: 'name@company.com',
							required: true,
							class: 'border outline-none dark:border-gray-600 dark:bg-gray-700'
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div>`);

				Label($$renderer, {
					class: labelClass,
					children: ($$renderer) => {
						$$renderer.push(`<span>Your password</span> `);

						Input($$renderer, {
							type: 'password',
							name: 'password',
							placeholder: '••••••••',
							required: true,
							class: 'border outline-none dark:border-gray-600 dark:bg-gray-700'
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div>`);

				Label($$renderer, {
					class: labelClass,
					children: ($$renderer) => {
						$$renderer.push(`<span>Confirm password</span> `);

						Input($$renderer, {
							type: 'password',
							name: 'confirm-password',
							placeholder: '••••••••',
							required: true,
							class: 'border outline-none dark:border-gray-600 dark:bg-gray-700'
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}