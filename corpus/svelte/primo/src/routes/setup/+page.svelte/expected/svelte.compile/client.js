import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { Users } from '$lib/pocketbase/collections';
import { Loader } from 'lucide-svelte';
import { self } from '$lib/pocketbase/managers';

var root = $.from_html(`<div class="loading-container svelte-g40i6i"><p class="error svelte-g40i6i"> </p></div>`);
var root_1 = $.from_html(`<div class="loading-container svelte-g40i6i"><!> <p class="svelte-g40i6i">Checking setup status...</p></div>`);
var root_2 = $.from_html(`<div class="error svelte-g40i6i"> </div>`);
var root_3 = $.from_html(`<div class="animate-spin absolute"><!></div>`);
var root_4 = $.from_html(`<!> <form class="form svelte-g40i6i"><div class="fields svelte-g40i6i"><label class="svelte-g40i6i"><span>Email</span> <input data-test-id="email" type="email" name="email" required="" class="svelte-g40i6i"/></label> <label class="svelte-g40i6i"><span>Password</span> <input data-test-id="password" type="password" name="password" required="" minlength="8" class="svelte-g40i6i"/></label> <label class="svelte-g40i6i"><span>Confirm Password</span> <input data-test-id="confirm-password" type="password" name="confirm-password" required="" class="svelte-g40i6i"/></label></div> <button class="button svelte-g40i6i" type="submit" data-test-id="create-user"><span>Create Account</span> <!></button></form>`, 1);
var root_5 = $.from_html(`<main class="primo-reset svelte-g40i6i"><div class="left svelte-g40i6i"><div class="box svelte-g40i6i"><header class="svelte-g40i6i"><h1 class="svelte-g40i6i">Welcome to Primo</h1> <p class="subtitle svelte-g40i6i">Create your admin account to get started</p></header> <!></div></div></main>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let email = $.state('');
	let password = $.state('');
	let confirm_password = $.state('');
	let loading = $.state(false);
	let checking_setup = $.state(true);
	let error = $.state('');
	const is_form_valid = $.derived(() => $.get(email).trim() !== '' && $.get(password).length >= 8 && $.get(confirm_password) !== '' && $.get(password) === $.get(confirm_password));
	const users = self.instance?.collection('users');
	const superusers = self.instance?.collection('_superusers');

	// Check if setup is already complete and redirect if so
	$.user_effect(() => {
		$.set(checking_setup, true);
		$.set(error, '');

		superusers.authWithPassword('__pbinstaller@example.com', 'public-secret').catch((err) => {
			$.set(error, 'Authentication failed! Setup may have been completed already.');

			throw err;
		}).then(() => {
			$.set(checking_setup, false);
		}).catch((err) => {
			console.error('Setup failed:', err);
		});
	});

	const create_user = async (event) => {
		event.preventDefault();

		if ($.get(password) !== $.get(confirm_password)) {
			$.set(error, 'Passwords do not match');

			return;
		}

		$.set(loading, true);
		$.set(error, '');

		try {
			await users.create({
				email: $.get(email),
				password: $.get(password),
				passwordConfirm: $.get(password),
				serverRole: 'developer'
			});

			await superusers.create({
				email: $.get(email),
				password: $.get(password),
				passwordConfirm: $.get(password)
			});

			// Authenticate the user immediately after creation
			try {
				await Users.authWithPassword($.get(email), $.get(password));
				console.log('User authenticated successfully');
			} catch(authError) {
				console.warn('Could not authenticate user:', authError);
			}

			// Go straight to site
			goto('/admin/site', { replaceState: true });
		} catch(err) {
			console.error('User creation error:', err);

			// Extract specific field errors if available
			if (err.response?.data) {
				const fieldErrors = Object.entries(err.response.data).map(([field, details]) => `${field}: ${details.message || details}`).join(', ');

				$.set(error, fieldErrors || err.message || 'Failed to create user', true);
			} else {
				$.set(error, err.message || 'Failed to create user', true);
			}
		}

		$.set(loading, false);
	};

	var main = root_5();
	var div = $.child(main);
	var div_1 = $.child(div);
	var node = $.sibling($.child(div_1), 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					var div_2 = root();
					var p = $.child(div_2);
					var text = $.only_child(p, true);

					$.reset(div_2);
					$.template_effect(() => $.set_text(text, $.get(error)));
					$.append($$anchor, div_2);
				};

				var alternate = ($$anchor) => {
					var div_3 = root_1();
					var node_2 = $.child(div_3);

					Loader(node_2, { class: 'animate-spin' });
					$.next(2);
					$.reset(div_3);
					$.append($$anchor, div_3);
				};

				$.if(node_1, ($$render) => {
					if ($.get(error)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment);
		};

		var alternate_1 = ($$anchor) => {
			var fragment_1 = root_4();
			var node_3 = $.first_child(fragment_1);

			{
				var consequent_2 = ($$anchor) => {
					var div_4 = root_2();
					var text_1 = $.only_child(div_4, true);

					$.template_effect(() => $.set_text(text_1, $.get(error)));
					$.append($$anchor, div_4);
				};

				$.if(node_3, ($$render) => {
					if ($.get(error)) $$render(consequent_2);
				});
			}

			var form = $.sibling(node_3, 2);
			var div_5 = $.child(form);
			var label = $.child(div_5);
			var input = $.sibling($.child(label), 2);

			$.remove_input_defaults(input);
			$.reset(label);

			var label_1 = $.sibling(label, 2);
			var input_1 = $.sibling($.child(label_1), 2);

			$.remove_input_defaults(input_1);
			$.reset(label_1);

			var label_2 = $.sibling(label_1, 2);
			var input_2 = $.sibling($.child(label_2), 2);

			$.remove_input_defaults(input_2);
			$.reset(label_2);
			$.reset(div_5);

			var button = $.sibling(div_5, 2);
			var span = $.child(button);
			let classes;
			var node_4 = $.sibling(span, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_6 = root_3();
					var node_5 = $.child(div_6);

					Loader(node_5, {});
					$.reset(div_6);
					$.append($$anchor, div_6);
				};

				$.if(node_4, ($$render) => {
					if ($.get(loading)) $$render(consequent_3);
				});
			}

			$.reset(button);
			$.reset(form);

			$.template_effect(() => {
				button.disabled = $.get(loading) || !$.get(is_form_valid);
				classes = $.set_class(span, 1, 'svelte-g40i6i', null, classes, { invisible: $.get(loading) });
			});

			$.event('submit', form, create_user);
			$.bind_value(input, () => $.get(email), ($$value) => $.set(email, $$value));
			$.bind_value(input_1, () => $.get(password), ($$value) => $.set(password, $$value));
			$.bind_value(input_2, () => $.get(confirm_password), ($$value) => $.set(confirm_password, $$value));
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(checking_setup)) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.reset(main);
	$.append($$anchor, main);
	$.pop();
}