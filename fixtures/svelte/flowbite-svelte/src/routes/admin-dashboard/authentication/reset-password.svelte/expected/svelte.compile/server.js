import * as $ from 'svelte/internal/server';
import { Label, Input } from "flowbite-svelte";
import { ResetPassword } from "flowbite-svelte-admin-dashboard";
import MetaTag from "../utils/MetaTag.svelte";

export default function Reset_password($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const title = "Reset your password";

		const site = {
			name: "Flowbite",
			img: "/images/flowbite-svelte-icon-logo.svg",
			link: "/",
			imgAlt: "FlowBite Logo"
		};

		const acceptTerms = true;
		const btnTitle = "Create account";
		const termsLink = "/";
		const labelClass = "mb-2 dark:text-white";
		const inputClass = "border outline-none dark:border-gray-600 dark:bg-gray-700";

		const onSubmit = (e) => {
			const formData = new FormData(e.target);
			const data = {};

			for (const field of formData.entries()) {
				const [key, value] = field;

				data[key] = value;
			}

			console.log(data);
		};

		const path = "/authentication/reset-password";
		const description = "Reset password example - Flowbite Svelte Admin Dashboard";
		const metaTitle = "Flowbite Svelte Admin Dashboard - Reset password";
		const subtitle = "Reset password";

		MetaTag($$renderer, { path, description, title: metaTitle, subtitle });
		$$renderer.push(`<!----> `);

		ResetPassword($$renderer, {
			title,
			site,
			acceptTerms,
			btnTitle,
			termsLink,
			onsubmit: onSubmit,
			children: ($$renderer) => {
				$$renderer.push(`<div>`);

				Label($$renderer, {
					for: 'email',
					class: labelClass,
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
					class: inputClass
				});

				$$renderer.push(`<!----></div> <div>`);

				Label($$renderer, {
					for: 'password',
					class: labelClass,
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
					class: inputClass
				});

				$$renderer.push(`<!----></div> <div>`);

				Label($$renderer, {
					for: 'confirm-password',
					class: labelClass,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Confirm password`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Input($$renderer, {
					type: 'password',
					name: 'confirm-password',
					id: 'confirm-password',
					placeholder: '••••••••',
					required: true,
					class: inputClass
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}