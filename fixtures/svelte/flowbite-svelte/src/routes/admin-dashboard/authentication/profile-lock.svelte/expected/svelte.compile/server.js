import * as $ from 'svelte/internal/server';
import { ProfileLock, imagesPath } from "flowbite-svelte-admin-dashboard";
import { Input, Label } from "flowbite-svelte";
import Users from "../data/users.json";
import MetaTag from "../utils/MetaTag.svelte";

export default function Profile_lock($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const onSubmit = (e) => {
			const formData = new FormData(e.target);

			console.log(formData);
		};

		let user = {
			img: imagesPath(Users[0].avatar, "users"),
			imgAlt: Users[0].name,
			name: Users[0].name
		};

		const path = "/authentication/profile-lock";
		const description = "Profile lock example - Flowbite Svelte Admin Dashboard";
		const metaTitle = "Flowbite Svelte Admin Dashboard - Profile lock";
		const subtitle = "Profile lock";

		MetaTag($$renderer, { path, description, title: metaTitle, subtitle });
		$$renderer.push(`<!----> `);

		ProfileLock($$renderer, {
			onsubmit: onSubmit,
			user,
			children: ($$renderer) => {
				$$renderer.push(`<div>`);

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