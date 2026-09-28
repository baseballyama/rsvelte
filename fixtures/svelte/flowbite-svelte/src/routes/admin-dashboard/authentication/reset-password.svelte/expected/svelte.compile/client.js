import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Input } from "flowbite-svelte";
import { ResetPassword } from "flowbite-svelte-admin-dashboard";
import MetaTag from "../utils/MetaTag.svelte";

var root = $.from_html(`<div><!> <!></div> <div><!> <!></div> <div><!> <!></div>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Reset_password($$anchor, $$props) {
	$.push($$props, true);

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
	var fragment = root_1();
	var node = $.first_child(fragment);

	MetaTag(node, { path, description, title: metaTitle, subtitle });

	var node_1 = $.sibling(node, 2);

	ResetPassword(node_1, {
		title,
		get site() {
			return site;
		},
		acceptTerms,
		btnTitle,
		termsLink,
		onsubmit: onSubmit,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div = $.first_child(fragment_1);
			var node_2 = $.child(div);

			Label(node_2, {
				for: 'email',
				class: labelClass,
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
				class: inputClass
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var node_4 = $.child(div_1);

			Label(node_4, {
				for: 'password',
				class: labelClass,
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
				class: inputClass
			});

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_6 = $.child(div_2);

			Label(node_6, {
				for: 'confirm-password',
				class: labelClass,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Confirm password');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Input(node_7, {
				type: 'password',
				name: 'confirm-password',
				id: 'confirm-password',
				placeholder: '••••••••',
				required: true,
				class: inputClass
			});

			$.reset(div_2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}