import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ForgotPassword } from "flowbite-svelte-admin-dashboard";
import { Label, Input, Checkbox, A } from "flowbite-svelte";
import MetaTag from "../utils/MetaTag.svelte";

var root = $.from_html(`I accept the <!>`, 1);
var root_1 = $.from_html(`<div><!> <!></div> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Forgot_password($$anchor, $$props) {
	$.push($$props, true);

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
	var fragment = root_2();
	var node = $.first_child(fragment);

	MetaTag(node, { path, description, title, subtitle });

	var node_1 = $.sibling(node, 2);

	ForgotPassword(node_1, {
		onsubmit: onSubmit,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var node_2 = $.child(div);

			Label(node_2, {
				for: 'email',
				class: 'mb-2',
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
				class: 'border outline-none'
			});

			$.reset(div);

			var node_4 = $.sibling(div, 2);

			Checkbox(node_4, {
				class: 'gap-1',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root();
					var node_5 = $.sibling($.first_child(fragment_2));

					A(node_5, {
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Terms and Conditions');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}