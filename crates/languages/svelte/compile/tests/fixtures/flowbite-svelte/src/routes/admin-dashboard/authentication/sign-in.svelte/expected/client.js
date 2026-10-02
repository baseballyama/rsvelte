import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Input } from "flowbite-svelte";
import { SignIn } from "flowbite-svelte-admin-dashboard";
import MetaTag from "../utils/MetaTag.svelte";

var root = $.from_html(`<div><!> <!></div> <div><!> <!></div>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Sign_in($$anchor, $$props) {
	$.push($$props, true);

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
	var fragment = root_1();
	var node = $.first_child(fragment);

	MetaTag(node, { path, description, title: metaTitle, subtitle });

	var node_1 = $.sibling(node, 2);

	SignIn(node_1, {
		title,
		get site() {
			return site;
		},
		rememberMe,
		lostPassword,
		createAccount,
		lostPasswordLink,
		loginTitle,
		registerLink,
		createAccountTitle,
		onsubmit: onSubmit,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div = $.first_child(fragment_1);
			var node_2 = $.child(div);

			Label(node_2, {
				for: 'email',
				class: 'mb-2 dark:text-white',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Your email');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Input(node_3, {
				type: 'email',
				name: 'email',
				id: 'email',
				placeholder: 'name@company.com',
				required: true,
				class: 'border outline-none dark:border-gray-600 dark:bg-gray-700'
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var node_4 = $.child(div_1);

			Label(node_4, {
				for: 'password',
				class: 'mb-2 dark:text-white',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Your password');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Input(node_5, {
				type: 'password',
				name: 'password',
				id: 'password',
				placeholder: '••••••••',
				required: true,
				class: 'border outline-none dark:border-gray-600 dark:bg-gray-700'
			});

			$.reset(div_1);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}