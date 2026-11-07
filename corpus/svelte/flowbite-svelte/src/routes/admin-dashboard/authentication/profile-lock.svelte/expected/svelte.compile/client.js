import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ProfileLock, imagesPath } from "flowbite-svelte-admin-dashboard";
import { Input, Label } from "flowbite-svelte";
import Users from "../data/users.json";
import MetaTag from "../utils/MetaTag.svelte";

var root = $.from_html(`<div><!> <!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Profile_lock($$anchor, $$props) {
	$.push($$props, true);

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
	var fragment = root_1();
	var node = $.first_child(fragment);

	MetaTag(node, { path, description, title: metaTitle, subtitle });

	var node_1 = $.sibling(node, 2);

	ProfileLock(node_1, {
		onsubmit: onSubmit,
		get user() {
			return user;
		},

		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node_2 = $.child(div);

			Label(node_2, {
				for: 'password',
				class: 'mb-2 dark:text-white',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Your password');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Input(node_3, {
				type: 'password',
				name: 'password',
				id: 'password',
				placeholder: '••••••••',
				required: true,
				class: 'border outline-none dark:border-gray-600 dark:bg-gray-700'
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}