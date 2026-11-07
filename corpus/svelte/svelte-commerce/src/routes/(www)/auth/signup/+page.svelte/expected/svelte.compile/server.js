import * as $ from 'svelte/internal/server';
import { LoaderIcon } from '@lucide/svelte';
import Button from '$lib/components/ui/button/button.svelte';
import { toast } from '@misiki/kitcommerce-core';
import Textbox from '$lib/components/form/textbox.svelte';
import { z } from 'zod';
import { getUserState } from '$lib/core/stores/index.js';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import AuthButton from '$lib/components/auth/auth-button.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const userState = getUserState();
		const IS_DEV = import.meta.env.DEV;
		let firstName = IS_DEV ? 'Swadesh' : '';
		let lastName = IS_DEV ? 'Behera' : '';
		let email = IS_DEV ? 'hi@litekart.in' : '';

		// let phone = $state(IS_DEV ? '+918249028220' : '')
		let password = IS_DEV ? 'litekart1' : '';

		let confirmPassword = IS_DEV ? 'litekart1' : '';
		let isLoading = false;

		const schemas = {
			firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must be less than 50 characters').regex(/^[a-zA-Z\s]*$/, 'First name can only contain letters and spaces'),
			lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must be less than 50 characters').regex(/^[a-zA-Z\s]*$/, 'Last name can only contain letters and spaces'),
			email: z.string().email('Please enter a valid email address').min(5, 'Email must be at least 5 characters').max(100, 'Email must be less than 100 characters'),
			// phone: z
			// 	.string()
			// 	.regex(/^(\+?\d{1,3}[- ]?)?\d{10}$/, 'Please enter a valid 10-digit phone number')
			// 	.refine((val) => {
			// 		// Remove any non-digit characters
			// 		const digits = val.replace(/\D/g, '')
			// 		// Check if it's exactly 10 digits or if it starts with country code
			// 		return digits.length === 10 || (digits.length > 9 && digits.length <= 17)
			// 	}, 'Phone number must be 10 digits'),
			password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password must be less than 100 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[a-z]/, 'Password must contain at least one lowercase letter').regex(/[0-9]/, 'Password must contain at least one number').regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
			confirmPassword: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password must be less than 100 characters').refine((val) => val === password, { message: 'Passwords do not match' })
		};

		async function handleSubmit(e) {
			e.preventDefault();

			try {
				isLoading = true;

				const ok = await userState.signup({
					firstName,
					lastName,
					email,
					// phone,
					password,
					origin: page.url.origin
				});

				// signup() swallows its own errors and returns false, so never claim success on a falsy result.
				if (!ok) return;

				toast.success('Account created successfully');
				goto(`/auth/signup/success?email=${encodeURIComponent(email)}`);
			} catch(e) {
				toast.error(e.message);
			} finally {
				isLoading = false;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('17eisb9', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Create Account - ${$.escape(page?.data?.store?.name || '')}</title>`);
				});

				$$renderer.push(`<meta name="description"${$.attr('content', `Create your account at ${$.stringify(page?.data?.store?.name)} to start shopping and discover amazing products.`)}/>`);
			});

			$$renderer.push(`<div class="flex min-h-screen items-center justify-center border bg-gray-50 p-3 dark:bg-gray-950 sm:p-4"><div class="w-full max-w-[420px] space-y-4 rounded-radius border bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6"><div class="space-y-1 text-center"><h2 class="text-2xl font-bold tracking-tight text-gray-950 dark:text-white">Create account</h2> <p class="text-sm text-gray-600 dark:text-gray-300">Save details for faster checkout.</p></div> <form class="space-y-3" aria-label="Sign up form"><div class="grid grid-cols-1 gap-3 sm:grid-cols-2">`);

			Textbox($$renderer, {
				name: 'firstName',
				placeholder: 'John',
				schema: schemas.firstName,
				label: 'First name',
				class: 'h-12',
				required: true,
				'aria-label': 'First name',
				autocomplete: 'given-name',
				get value() {
					return firstName;
				},

				set value($$value) {
					firstName = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Textbox($$renderer, {
				name: 'lastName',
				placeholder: 'Doe',
				schema: schemas.lastName,
				label: 'Last name',
				class: 'h-12',
				required: true,
				'aria-label': 'Last name',
				autocomplete: 'family-name',
				get value() {
					return lastName;
				},

				set value($$value) {
					lastName = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> `);

			Textbox($$renderer, {
				name: 'email',
				type: 'email',
				placeholder: 'you@example.com',
				schema: schemas.email,
				label: 'Email address',
				class: 'h-12',
				required: true,
				'aria-label': 'Email address',
				autocomplete: 'email',
				get value() {
					return email;
				},

				set value($$value) {
					email = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Textbox($$renderer, {
				name: 'password',
				type: 'password',
				placeholder: 'Enter a password',
				schema: schemas.password,
				label: 'Password',
				class: 'h-12',
				required: true,
				'aria-label': 'Password',
				autocomplete: 'new-password',
				get value() {
					return password;
				},

				set value($$value) {
					password = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Textbox($$renderer, {
				name: 'confirmPassword',
				type: 'password',
				placeholder: 'Confirm your password',
				schema: schemas.confirmPassword,
				label: 'Confirm password',
				class: 'h-12',
				required: true,
				'aria-label': 'Confirm password',
				autocomplete: 'new-password',
				get value() {
					return confirmPassword;
				},

				set value($$value) {
					confirmPassword = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				type: 'submit',
				class: 'h-12 w-full text-wrap px-4 py-2 text-base font-semibold shadow-sm transition-colors',
				disabled: isLoading,
				'aria-label': isLoading ? 'Creating account...' : 'Create account',
				children: ($$renderer) => {
					if (isLoading) {
						$$renderer.push('<!--[0-->');
						LoaderIcon($$renderer, { class: 'mr-2 h-5 w-5 animate-spin', 'aria-hidden': 'true' });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> ${$.escape(isLoading ? 'Creating account...' : 'Create account')}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></form> <div class="text-center"><p class="text-sm text-gray-600 dark:text-gray-300">Already have an account? `);

			AuthButton($$renderer, {
				type: 'login',
				children: ($$renderer) => {
					Button($$renderer, {
						variant: 'link',
						class: 'ml-1 inline-flex min-h-10 px-0 font-semibold text-gray-950 transition-colors hover:underline dark:text-white',
						'aria-label': 'Sign in to your account',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Sign in`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></p></div> `);

			if (page?.data?.store?.plugins?.isMultiVendor?.active) {
				$$renderer.push(`<!--[0--><div class="space-y-3"><div class="relative"><div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-200 dark:border-gray-700"></div></div> <div class="relative flex justify-center text-xs"><span class="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">or</span></div></div> <a href="/auth/join-as-vendor" class="inline-flex min-h-11 w-full items-center justify-center rounded-radius border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-950 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white" aria-label="Join as a vendor">Join as a Vendor</a></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}