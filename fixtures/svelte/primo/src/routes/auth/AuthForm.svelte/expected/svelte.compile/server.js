import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { Users } from '$lib/pocketbase/collections';
import { self } from '$lib/pocketbase/managers';
import { Loader, User } from 'lucide-svelte';

export default function AuthForm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			title,
			email = void 0,
			password = null,
			action,
			footer = null
		} = $$props;

		let confirm_password = '';
		let passwordResetRequested = false;
		let loading = false;
		let error = '';
		let name = '';
		let avatar = '';
		let avatarFile = null;
		const createToken = $.derived(() => page.url.searchParams.get('create') || '');
		const invitedEmail = $.derived(() => page.url.searchParams.get('email') || '');

		const handleAvatarChange = async (event) => {
			const target = event.target;
			const input_file = target.files?.[0];

			if (!input_file) return;

			error = '';

			let file = input_file;

			// iPhones save photos as HEIC by default; PocketBase rejects them. Convert to JPEG.
			const is_heic = (/\.hei[cf]$/i).test(file.name) || (/image\/hei[cf]/i).test(file.type);

			if (is_heic) {
				try {
					loading = true;

					const { default: heic2any } = await import('heic2any');
					const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
					const blob = Array.isArray(converted) ? converted[0] : converted;

					file = new File([blob], file.name.replace(/\.hei[cf]$/i, '.jpg'), { type: 'image/jpeg' });
				} catch(err) {
					error = 'Could not read this photo. Try a JPEG or PNG instead.';

					return;
				} finally {
					loading = false;
				}
			}

			avatarFile = file;
			avatar = URL.createObjectURL(file);
		};

		const submit = async (event) => {
			event.preventDefault();

			switch (action) {
				case 'sign_in':
					loading = true;
					await Users.authWithPassword(email, password).then(() => goto('/admin/site')).catch(({ message }) => {
						error = message;
					});
					loading = false;
					break;

				case 'reset_password':
					loading = true;
					await Users.requestPasswordReset(email).then(() => {
						passwordResetRequested = true;
					}).catch(({ message }) => {
						error = message;
					});
					loading = false;
					break;

				case 'confirm_password_reset':
					loading = true;
					const token = page.url.searchParams.get('reset') || '';
					await Users.confirmPasswordReset(token, password, confirm_password).then(() => goto('/admin/auth')).catch((err) => {
						// Extract the actual error message from PocketBase
						if (err.response?.data?.password) {
							error = err.response.data.password.message;
						} else if (err.response?.message) {
							error = err.response.message;
						} else {
							error = err.message || 'An error occurred';
						}
					});
					loading = false;
					break;

				case 'create_account':
					loading = true;
					await Users.confirmPasswordReset(createToken(), password, confirm_password).then(async () => {
						if (invitedEmail()) {
							// Auto-login invited users
							await Users.authWithPassword(invitedEmail(), password);

							// Update user with name and avatar if provided
							const userId = self.instance?.authStore.record?.id;

							if ((name || avatarFile) && userId) {
								const data = {};

								if (name) data.name = name;
								if (avatarFile) data.avatar = avatarFile;

								await self.instance?.collection('users').update(userId, data);
							}

							await goto('/admin/site');
						} else {
							await goto('/admin/auth');
						}
					}).catch((err) => {
						// Extract the actual error message from PocketBase
						if (err.response?.data?.password) {
							error = err.response.data.password.message;
						} else if (err.response?.message) {
							error = err.response.message;
						} else {
							error = err.message || 'An error occurred';
						}
					});
					loading = false;
					break;

				default:
					throw new Error('Unknown action');
			}
		};

		$$renderer.push(`<header class="svelte-2n9ygt"><h1 class="svelte-2n9ygt">${$.escape(title)}</h1></header> `);

		if (error) {
			$$renderer.push(`<!--[0--><div class="error svelte-2n9ygt">${$.escape(error)}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (passwordResetRequested) {
			$$renderer.push(`<!--[0--><div class="message svelte-2n9ygt">Password reset has been sent to your email. Remember to also check the spam folder.</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <form class="form svelte-2n9ygt"><div class="fields svelte-2n9ygt">`);

		if (action !== 'confirm_password_reset' && action !== 'create_account') {
			$$renderer.push(`<!--[0--><label class="svelte-2n9ygt"><span class="svelte-2n9ygt">Email</span> <input data-test-id="email"${$.attr('value', email)} type="text" name="email"${$.attr('disabled', passwordResetRequested, true)} class="svelte-2n9ygt"/></label>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (action === 'create_account' && invitedEmail()) {
			$$renderer.push(`<!--[0--><label class="svelte-2n9ygt"><span class="svelte-2n9ygt">Email</span> <input data-test-id="email"${$.attr('value', email)} type="text" name="email" disabled="" class="svelte-2n9ygt"/></label> <div class="grid grid-cols-[1fr_auto] gap-2 items-end svelte-2n9ygt"><label class="grid gap-2 svelte-2n9ygt"><span class="svelte-2n9ygt">Name &amp; Avatar</span> <input data-test-id="name"${$.attr('value', name)} type="text" name="name" placeholder="John Doe" class="svelte-2n9ygt"/></label> <div class="relative svelte-2n9ygt">`);

			if (avatar) {
				$$renderer.push(`<!--[0--><img${$.attr('src', avatar)} alt="Avatar preview" class="h-[50px] w-[50px] rounded-lg object-cover border border-gray-600 bg-gray-800 svelte-2n9ygt"/>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="h-[50px] w-[50px] rounded-lg border border-gray-600 bg-gray-800 flex items-center justify-center text-gray-600 svelte-2n9ygt">`);
				User($$renderer, { size: 20 });
				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]--> <input type="file" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer svelte-2n9ygt"/></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (action !== 'reset_password') {
			$$renderer.push(`<!--[0--><label class="svelte-2n9ygt"><span class="svelte-2n9ygt">Password</span> <input data-test-id="password"${$.attr('value', password)} type="password" name="password" class="svelte-2n9ygt"/></label>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (action === 'confirm_password_reset' || action === 'create_account') {
			$$renderer.push(`<!--[0--><label class="svelte-2n9ygt"><span class="svelte-2n9ygt">Confirm Password</span> <input data-test-id="confirm-password"${$.attr('value', confirm_password)} type="password" name="confirm-password" class="svelte-2n9ygt"/></label>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <button class="button svelte-2n9ygt" type="submit" data-test-id="submit"${$.attr('disabled', passwordResetRequested, true)}><span${$.attr_class('svelte-2n9ygt', void 0, { 'invisible': loading })}>${$.escape(title)}</span> `);

		if (loading) {
			$$renderer.push(`<!--[0--><div class="animate-spin absolute svelte-2n9ygt">`);
			Loader($$renderer, {});
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></button></form> `);

		if (footer) {
			$$renderer.push(`<!--[0--><span class="footer-text svelte-2n9ygt">`);
			footer($$renderer);
			$$renderer.push(`<!----></span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { email, password });
	});
}