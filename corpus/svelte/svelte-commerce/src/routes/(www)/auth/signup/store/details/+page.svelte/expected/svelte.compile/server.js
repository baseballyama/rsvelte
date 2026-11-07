import * as $ from 'svelte/internal/server';
import { LoaderIcon } from '@lucide/svelte';
import Button from '$lib/components/ui/button/button.svelte';
import { authService } from '$lib/core/services/index.js';
import { toast } from '@misiki/kitcommerce-core';
import Textbox from '$lib/components/form/textbox.svelte';
import { z } from 'zod';
import { getUserState } from '$lib/core/stores/index.js';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/state';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const userState = getUserState();
		const IS_DEV = import.meta.env.DEV;
		let firstName = IS_DEV ? 'Swadesh' : '';
		let lastName = IS_DEV ? 'Behera' : '';
		let email = IS_DEV ? 'hi1@litekart.in' : '';
		let phone = IS_DEV ? '+918249028220' : '';
		let password = IS_DEV ? 'litekart' : '';
		let confirmPassword = IS_DEV ? 'litekart' : '';
		let isLoading = false;

		onMount(() => {
			// Get email from previous step
			const savedEmail = sessionStorage.getItem('signup_email');

			if (!savedEmail) {
				goto('/auth/signup/store');
			}

			email = savedEmail ?? '';
		});

		const schemas = {
			firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must be less than 50 characters').regex(/^[a-zA-Z\s]*$/, 'First name can only contain letters and spaces'),
			lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must be less than 50 characters').regex(/^[a-zA-Z\s]*$/, 'Last name can only contain letters and spaces'),
			phone: z.string().regex(/^(\+?\d{1,3}[- ]?)?\d{10}$/, 'Please enter a valid phone number').refine(
				(val) => {
					// Remove any non-digit characters
					const digits = val.replace(/\D/g, '');

					// Check if it's exactly 10 digits or if it starts with country code
					return digits.length === 9 || digits.length > 9 && digits.length <= 17;
				},
				'Please enter a valid phone number'
			),
			password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password must be less than 100 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[a-z]/, 'Password must contain at least one lowercase letter').regex(/[0-9]/, 'Password must contain at least one number').regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
			confirmPassword: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password must be less than 100 characters').refine((val) => val === password, { message: 'Passwords do not match' })
		};

		async function handleSubmit(e) {
			e.preventDefault();

			try {
				isLoading = true;

				const res = await authService.joinAsAdmin({
					firstName,
					lastName,
					businessName: 'Litekart',
					phone,
					email,
					password,
					origin: page.url.origin
				});

				if (!res?.id) {
					toast.error('Failed to create account');
				}

				// Only clear storage and redirect on success
				sessionStorage.removeItem('signup_email');

				toast.success('Account created successfully');
				goto(`/auth/signup/success?email=${encodeURIComponent(email)}`);
			} catch(e) {
				toast.error(e.message || 'Failed to create account');

				// Don't redirect, let user fix the error and try again
			} finally {
				isLoading = false;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('1ipkjju', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Complete Store Setup - ${$.escape(page?.data?.store?.name || '')}</title>`);
				});

				$$renderer.push(`<meta name="description"${$.attr('content', `Complete your store setup at ${$.stringify(page?.data?.store?.name)} and start selling online.`)}/>`);
			});

			$$renderer.push(`<div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4 dark:from-gray-900 dark:to-gray-800" role="main"><div class="grid w-full max-w-4xl items-center gap-8 md:grid-cols-2"><div class="hidden space-y-6 p-8 md:block" aria-hidden="true"><div class="space-y-4"><h1 class="text-4xl font-bold tracking-tighter text-[#1E293B] sm:text-5xl xl:text-6xl/none">Almost there!</h1> <p class="text-lg text-gray-600 dark:text-gray-300">Complete your account details to start setting up your store.</p></div> <div class="space-y-8"><div class="relative"><div class="flex items-center space-x-4"><div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></div> <div><p class="font-medium text-gray-900 dark:text-white">Email verification</p> <p class="text-sm text-gray-500">${$.escape(email)}</p></div></div></div> <div class="relative"><div class="flex items-center space-x-4"><div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white"><span class="text-sm font-bold">2</span></div> <div><p class="font-medium text-gray-900 dark:text-white">Account setup</p> <p class="text-sm text-gray-500">Create your login credentials</p></div></div></div></div></div> <div class="w-full max-w-md transform space-y-6 rounded-xl bg-white/80 p-8 shadow-2xl backdrop-blur-sm transition-all dark:bg-gray-800/90"><div class="space-y-2"><h2 class="text-2xl font-bold text-gray-900 dark:text-white">Complete your details</h2> <p class="text-gray-500 dark:text-gray-400">Fill in your information to create your store</p></div> <form class="space-y-4" aria-label="Store details form"><div class="grid grid-cols-2 gap-4">`);

			Textbox($$renderer, {
				name: 'firstName',
				placeholder: 'John',
				schema: schemas.firstName,
				label: 'First Name',
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
				label: 'Last Name',
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
				name: 'phone',
				type: 'tel',
				placeholder: '+1234567890',
				schema: schemas.phone,
				label: 'Phone number',
				required: true,
				'aria-label': 'Phone number',
				autocomplete: 'tel',
				get value() {
					return phone;
				},

				set value($$value) {
					phone = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Textbox($$renderer, {
				name: 'password',
				type: 'password',
				placeholder: '••••••••',
				schema: schemas.password,
				label: 'Password',
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
				placeholder: '••••••••',
				schema: schemas.confirmPassword,
				label: 'Confirm password',
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
				class: 'w-full',
				disabled: isLoading,
				'aria-label': isLoading ? 'Creating store...' : 'Create store',
				children: ($$renderer) => {
					if (isLoading) {
						$$renderer.push('<!--[0-->');
						LoaderIcon($$renderer, { class: 'mr-2 h-4 w-4 animate-spin', 'aria-hidden': 'true' });
						$$renderer.push(`<!----> <span class="sr-only">Creating store...</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> ${$.escape(isLoading ? 'Creating store...' : 'Create store')}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></form> <div class="text-center"><button class="text-sm text-gray-500 hover:text-gray-700">← Back to email</button></div></div></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}