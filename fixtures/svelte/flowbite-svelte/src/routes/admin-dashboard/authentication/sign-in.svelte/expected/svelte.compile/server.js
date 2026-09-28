import * as $ from 'svelte/internal/server';
import { Label, Input } from "flowbite-svelte";
import { SignIn } from "flowbite-svelte-admin-dashboard";
import MetaTag from "../utils/MetaTag.svelte";

export default function Sign_in($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let title = "Sign in to platform";

		let site = {
			name: "Flowbite",
			img: "/images/flowbite-svelte-icon-logo.svg",
			link: "/",
			imgAlt: "FlowBite Logo"
		};

		let rememberMe = true;
		let lostPassword = true;
		let createAccount = true;
		let lostPasswordLink = "forgot-password";
		let loginTitle = "Login to your account";
		let registerLink = "/";
		let createAccountTitle = "Create account";

		const onSubmit = (e) => {
			const formData = new FormData(e.target);
			const data = {};

			for (const field of formData.entries()) {
				const [key, value] = field;

				data[key] = value;
			}

			console.log(data);
		};

		const path = "/authentication/sign-in";
		const description = "Sign in example - Flowbite Svelte Admin Dashboard";
		const metaTitle = "Flowbite Svelte Admin Dashboard - Sign in";
		const subtitle = "Sign in";

		MetaTag($$renderer, { path, description, title: metaTitle, subtitle });
		$$renderer.push(`<!----> `);

		SignIn($$renderer, {
			title,
			site,
			rememberMe,
			lostPassword,
			createAccount,
			lostPasswordLink,
			loginTitle,
			registerLink,
			createAccountTitle,
			onsubmit: onSubmit,
			children: ($$renderer) => {
				$$renderer.push(`<div>`);

				Label($$renderer, {
					for: 'email',
					class: 'mb-2 dark:text-white',
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
					class: 'border outline-none dark:border-gray-600 dark:bg-gray-700'
				});

				$$renderer.push(`<!----></div> <div>`);

				Label($$renderer, {
					for: 'password',
					class: 'mb-2 dark:text-white',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Your password`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Input($$renderer, {
					type: 'password',
					name: 'password',
					id: 'password',
					placeholder: '••••••••',
					required: true,
					class: 'border outline-none dark:border-gray-600 dark:bg-gray-700'
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}