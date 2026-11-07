import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { Users } from '$lib/pocketbase/collections';
import { Loader } from 'lucide-svelte';
import { self } from '$lib/pocketbase/managers';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let email = '';
		let password = '';
		let confirm_password = '';
		let loading = false;
		let checking_setup = true;
		let error = '';
		const is_form_valid = $.derived(() => email.trim() !== '' && password.length >= 8 && confirm_password !== '' && password === confirm_password);
		const users = self.instance?.collection('users');
		const superusers = self.instance?.collection('_superusers');

		// Check if setup is already complete and redirect if so
		const create_user = async (event) => {
			event.preventDefault();

			if (password !== confirm_password) {
				error = 'Passwords do not match';

				return;
			}

			loading = true;
			error = '';

			try {
				await users.create({
					email,
					password,
					passwordConfirm: password,
					serverRole: 'developer'
				});

				await superusers.create({ email, password, passwordConfirm: password });

				// Authenticate the user immediately after creation
				try {
					await Users.authWithPassword(email, password);
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

					error = fieldErrors || err.message || 'Failed to create user';
				} else {
					error = err.message || 'Failed to create user';
				}
			}

			loading = false;
		};

		$$renderer.push(`<main class="primo-reset svelte-g40i6i"><div class="left svelte-g40i6i"><div class="box svelte-g40i6i"><header class="svelte-g40i6i"><h1 class="svelte-g40i6i">Welcome to Primo</h1> <p class="subtitle svelte-g40i6i">Create your admin account to get started</p></header> `);

		if (checking_setup) {
			$$renderer.push('<!--[0-->');

			if (error) {
				$$renderer.push(`<!--[0--><div class="loading-container svelte-g40i6i"><p class="error svelte-g40i6i">${$.escape(error)}</p></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="loading-container svelte-g40i6i">`);
				Loader($$renderer, { class: 'animate-spin' });
				$$renderer.push(`<!----> <p class="svelte-g40i6i">Checking setup status...</p></div>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');

			if (error) {
				$$renderer.push(`<!--[0--><div class="error svelte-g40i6i">${$.escape(error)}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <form class="form svelte-g40i6i"><div class="fields svelte-g40i6i"><label class="svelte-g40i6i"><span>Email</span> <input data-test-id="email"${$.attr('value', email)} type="email" name="email" required="" class="svelte-g40i6i"/></label> <label class="svelte-g40i6i"><span>Password</span> <input data-test-id="password"${$.attr('value', password)} type="password" name="password" required="" minlength="8" class="svelte-g40i6i"/></label> <label class="svelte-g40i6i"><span>Confirm Password</span> <input data-test-id="confirm-password"${$.attr('value', confirm_password)} type="password" name="confirm-password" required="" class="svelte-g40i6i"/></label></div> <button class="button svelte-g40i6i" type="submit" data-test-id="create-user"${$.attr('disabled', loading || !is_form_valid(), true)}><span${$.attr_class('svelte-g40i6i', void 0, { 'invisible': loading })}>Create Account</span> `);

			if (loading) {
				$$renderer.push(`<!--[0--><div class="animate-spin absolute">`);
				Loader($$renderer, {});
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></button></form>`);
		}

		$$renderer.push(`<!--]--></div></div></main>`);
	});
}