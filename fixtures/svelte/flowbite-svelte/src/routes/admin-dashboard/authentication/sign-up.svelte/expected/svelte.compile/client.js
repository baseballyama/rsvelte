import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Input } from "flowbite-svelte";
import { SignUp } from "flowbite-svelte-admin-dashboard";
import MetaTag from "../utils/MetaTag.svelte";

var root = $.from_html(`<span>Your email</span> <!>`, 1);
var root_1 = $.from_html(`<span>Your password</span> <!>`, 1);
var root_2 = $.from_html(`<span>Confirm password</span> <!>`, 1);
var root_3 = $.from_html(`<div><!></div> <div><!></div> <div><!></div>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function Sign_up($$anchor, $$props) {
	$.push($$props, true);

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
	var fragment = root_4();
	var node = $.first_child(fragment);

	MetaTag(node, { path, description, title: metaTitle, subtitle });

	var node_1 = $.sibling(node, 2);

	SignUp(node_1, {
		title,
		get site() {
			return site;
		},
		acceptTerms,
		haveAccount,
		btnTitle,
		termsLink,
		loginLink,
		onsubmit: onSubmit,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var div = $.first_child(fragment_1);
			var node_2 = $.child(div);

			Label(node_2, {
				class: labelClass,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.sibling($.first_child(fragment_2), 2);

					Input(node_3, {
						type: 'email',
						name: 'email',
						placeholder: 'name@company.com',
						required: true,
						class: 'border outline-none dark:border-gray-600 dark:bg-gray-700'
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var node_4 = $.child(div_1);

			Label(node_4, {
				class: labelClass,
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_5 = $.sibling($.first_child(fragment_3), 2);

					Input(node_5, {
						type: 'password',
						name: 'password',
						placeholder: '••••••••',
						required: true,
						class: 'border outline-none dark:border-gray-600 dark:bg-gray-700'
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_6 = $.child(div_2);

			Label(node_6, {
				class: labelClass,
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_2();
					var node_7 = $.sibling($.first_child(fragment_4), 2);

					Input(node_7, {
						type: 'password',
						name: 'confirm-password',
						placeholder: '••••••••',
						required: true,
						class: 'border outline-none dark:border-gray-600 dark:bg-gray-700'
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}