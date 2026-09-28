import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { Users } from '$lib/pocketbase/collections';
import { self } from '$lib/pocketbase/managers';
import { Loader, User } from 'lucide-svelte';

var root = $.from_html(`<div class="error svelte-2n9ygt"> </div>`);
var root_1 = $.from_html(`<div class="message svelte-2n9ygt">Password reset has been sent to your email. Remember to also check the spam folder.</div>`);
var root_2 = $.from_html(`<label class="svelte-2n9ygt"><span class="svelte-2n9ygt">Email</span> <input data-test-id="email" type="text" name="email" class="svelte-2n9ygt"/></label>`);
var root_3 = $.from_html(`<img alt="Avatar preview" class="h-[50px] w-[50px] rounded-lg object-cover border border-gray-600 bg-gray-800 svelte-2n9ygt"/>`);
var root_4 = $.from_html(`<div class="h-[50px] w-[50px] rounded-lg border border-gray-600 bg-gray-800 flex items-center justify-center text-gray-600 svelte-2n9ygt"><!></div>`);
var root_5 = $.from_html(`<label class="svelte-2n9ygt"><span class="svelte-2n9ygt">Email</span> <input data-test-id="email" type="text" name="email" disabled="" class="svelte-2n9ygt"/></label> <div class="grid grid-cols-[1fr_auto] gap-2 items-end svelte-2n9ygt"><label class="grid gap-2 svelte-2n9ygt"><span class="svelte-2n9ygt">Name & Avatar</span> <input data-test-id="name" type="text" name="name" placeholder="John Doe" class="svelte-2n9ygt"/></label> <div class="relative svelte-2n9ygt"><!> <input type="file" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer svelte-2n9ygt"/></div></div>`, 1);
var root_6 = $.from_html(`<label class="svelte-2n9ygt"><span class="svelte-2n9ygt">Password</span> <input data-test-id="password" type="password" name="password" class="svelte-2n9ygt"/></label>`);
var root_7 = $.from_html(`<label class="svelte-2n9ygt"><span class="svelte-2n9ygt">Confirm Password</span> <input data-test-id="confirm-password" type="password" name="confirm-password" class="svelte-2n9ygt"/></label>`);
var root_8 = $.from_html(`<div class="animate-spin absolute svelte-2n9ygt"><!></div>`);
var root_9 = $.from_html(`<span class="footer-text svelte-2n9ygt"><!></span>`);
var root_10 = $.from_html(`<header class="svelte-2n9ygt"><h1 class="svelte-2n9ygt"> </h1></header> <!> <!> <form class="form svelte-2n9ygt"><div class="fields svelte-2n9ygt"><!> <!> <!> <!></div> <button class="button svelte-2n9ygt" type="submit" data-test-id="submit"><span> </span> <!></button></form> <!>`, 1);

export default function AuthForm($$anchor, $$props) {
	$.push($$props, true);

	let email = $.prop($$props, 'email', 15),
		password = $.prop($$props, 'password', 15, null),
		footer = $.prop($$props, 'footer', 3, null);

	let confirm_password = $.state('');
	let passwordResetRequested = $.state(false);
	let loading = $.state(false);
	let error = $.state('');
	let name = $.state('');
	let avatar = $.state('');
	let avatarFile = $.state(null);
	const createToken = $.derived(() => page.url.searchParams.get('create') || '');
	const invitedEmail = $.derived(() => page.url.searchParams.get('email') || '');

	const handleAvatarChange = async (event) => {
		const target = event.target;
		const input_file = target.files?.[0];

		if (!input_file) return;

		$.set(error, '');

		let file = input_file;

		// iPhones save photos as HEIC by default; PocketBase rejects them. Convert to JPEG.
		const is_heic = (/\.hei[cf]$/i).test(file.name) || (/image\/hei[cf]/i).test(file.type);

		if (is_heic) {
			try {
				$.set(loading, true);

				const { default: heic2any } = await import('heic2any');
				const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
				const blob = Array.isArray(converted) ? converted[0] : converted;

				file = new File([blob], file.name.replace(/\.hei[cf]$/i, '.jpg'), { type: 'image/jpeg' });
			} catch(err) {
				$.set(error, 'Could not read this photo. Try a JPEG or PNG instead.');

				return;
			} finally {
				$.set(loading, false);
			}
		}

		$.set(avatarFile, file, true);
		$.set(avatar, URL.createObjectURL(file), true);
	};

	const submit = async (event) => {
		event.preventDefault();

		switch ($$props.action) {
			case 'sign_in':
				$.set(loading, true);
				await Users.authWithPassword(email(), password()).then(() => goto('/admin/site')).catch(({ message }) => {
					$.set(error, message, true);
				});
				$.set(loading, false);
				break;

			case 'reset_password':
				$.set(loading, true);
				await Users.requestPasswordReset(email()).then(() => {
					$.set(passwordResetRequested, true);
				}).catch(({ message }) => {
					$.set(error, message, true);
				});
				$.set(loading, false);
				break;

			case 'confirm_password_reset':
				$.set(loading, true);
				const token = page.url.searchParams.get('reset') || '';
				await Users.confirmPasswordReset(token, password(), $.get(confirm_password)).then(() => goto('/admin/auth')).catch((err) => {
					// Extract the actual error message from PocketBase
					if (err.response?.data?.password) {
						$.set(error, err.response.data.password.message, true);
					} else if (err.response?.message) {
						$.set(error, err.response.message, true);
					} else {
						$.set(error, err.message || 'An error occurred', true);
					}
				});
				$.set(loading, false);
				break;

			case 'create_account':
				$.set(loading, true);
				await Users.confirmPasswordReset($.get(createToken), password(), $.get(confirm_password)).then(async () => {
					if ($.get(invitedEmail)) {
						// Auto-login invited users
						await Users.authWithPassword($.get(invitedEmail), password());

						// Update user with name and avatar if provided
						const userId = self.instance?.authStore.record?.id;

						if (($.get(name) || $.get(avatarFile)) && userId) {
							const data = {};

							if ($.get(name)) data.name = $.get(name);
							if ($.get(avatarFile)) data.avatar = $.get(avatarFile);

							await self.instance?.collection('users').update(userId, data);
						}

						await goto('/admin/site');
					} else {
						await goto('/admin/auth');
					}
				}).catch((err) => {
					// Extract the actual error message from PocketBase
					if (err.response?.data?.password) {
						$.set(error, err.response.data.password.message, true);
					} else if (err.response?.message) {
						$.set(error, err.response.message, true);
					} else {
						$.set(error, err.message || 'An error occurred', true);
					}
				});
				$.set(loading, false);
				break;

			default:
				throw new Error('Unknown action');
		}
	};

	var fragment = root_10();
	var header = $.first_child(fragment);
	var h1 = $.child(header);
	var text = $.only_child(h1, true);

	$.reset(header);

	var node = $.sibling(header, 2);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var text_1 = $.only_child(div, true);

			$.template_effect(() => $.set_text(text_1, $.get(error)));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(error)) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_1 = root_1();

			$.append($$anchor, div_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(passwordResetRequested)) $$render(consequent_1);
		});
	}

	var form = $.sibling(node_1, 2);
	var div_2 = $.child(form);
	var node_2 = $.child(div_2);

	{
		var consequent_2 = ($$anchor) => {
			var label = root_2();
			var input = $.sibling($.child(label), 2);

			$.remove_input_defaults(input);
			$.reset(label);
			$.template_effect(() => input.disabled = $.get(passwordResetRequested));
			$.bind_value(input, email);
			$.append($$anchor, label);
		};

		$.if(node_2, ($$render) => {
			if ($$props.action !== 'confirm_password_reset' && $$props.action !== 'create_account') $$render(consequent_2);
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_1 = root_5();
			var label_1 = $.first_child(fragment_1);
			var input_1 = $.sibling($.child(label_1), 2);

			$.remove_input_defaults(input_1);
			$.reset(label_1);

			var div_3 = $.sibling(label_1, 2);
			var label_2 = $.child(div_3);
			var input_2 = $.sibling($.child(label_2), 2);

			$.remove_input_defaults(input_2);
			$.reset(label_2);

			var div_4 = $.sibling(label_2, 2);
			var node_4 = $.child(div_4);

			{
				var consequent_3 = ($$anchor) => {
					var img = root_3();

					$.template_effect(() => $.set_attribute(img, 'src', $.get(avatar)));
					$.append($$anchor, img);
				};

				var alternate = ($$anchor) => {
					var div_5 = root_4();
					var node_5 = $.child(div_5);

					User(node_5, { size: 20 });
					$.reset(div_5);
					$.append($$anchor, div_5);
				};

				$.if(node_4, ($$render) => {
					if ($.get(avatar)) $$render(consequent_3); else $$render(alternate, -1);
				});
			}

			var input_3 = $.sibling(node_4, 2);

			$.reset(div_4);
			$.reset(div_3);
			$.bind_value(input_1, email);
			$.bind_value(input_2, () => $.get(name), ($$value) => $.set(name, $$value));
			$.delegated('change', input_3, handleAvatarChange);
			$.append($$anchor, fragment_1);
		};

		$.if(node_3, ($$render) => {
			if ($$props.action === 'create_account' && $.get(invitedEmail)) $$render(consequent_4);
		});
	}

	var node_6 = $.sibling(node_3, 2);

	{
		var consequent_5 = ($$anchor) => {
			var label_3 = root_6();
			var input_4 = $.sibling($.child(label_3), 2);

			$.remove_input_defaults(input_4);
			$.reset(label_3);
			$.bind_value(input_4, password);
			$.append($$anchor, label_3);
		};

		$.if(node_6, ($$render) => {
			if ($$props.action !== 'reset_password') $$render(consequent_5);
		});
	}

	var node_7 = $.sibling(node_6, 2);

	{
		var consequent_6 = ($$anchor) => {
			var label_4 = root_7();
			var input_5 = $.sibling($.child(label_4), 2);

			$.remove_input_defaults(input_5);
			$.reset(label_4);
			$.bind_value(input_5, () => $.get(confirm_password), ($$value) => $.set(confirm_password, $$value));
			$.append($$anchor, label_4);
		};

		$.if(node_7, ($$render) => {
			if ($$props.action === 'confirm_password_reset' || $$props.action === 'create_account') $$render(consequent_6);
		});
	}

	$.reset(div_2);

	var button = $.sibling(div_2, 2);
	var span = $.child(button);
	let classes;
	var text_2 = $.only_child(span, true);
	var node_8 = $.sibling(span, 2);

	{
		var consequent_7 = ($$anchor) => {
			var div_6 = root_8();
			var node_9 = $.child(div_6);

			Loader(node_9, {});
			$.reset(div_6);
			$.append($$anchor, div_6);
		};

		$.if(node_8, ($$render) => {
			if ($.get(loading)) $$render(consequent_7);
		});
	}

	$.reset(button);
	$.reset(form);

	var node_10 = $.sibling(form, 2);

	{
		var consequent_8 = ($$anchor) => {
			var span_1 = root_9();
			var node_11 = $.child(span_1);

			$.snippet(node_11, footer);
			$.reset(span_1);
			$.append($$anchor, span_1);
		};

		$.if(node_10, ($$render) => {
			if (footer()) $$render(consequent_8);
		});
	}

	$.template_effect(() => {
		$.set_text(text, $$props.title);
		button.disabled = $.get(passwordResetRequested);
		classes = $.set_class(span, 1, 'svelte-2n9ygt', null, classes, { invisible: $.get(loading) });
		$.set_text(text_2, $$props.title);
	});

	$.event('submit', form, submit);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['change']);