import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button/button.svelte';
import { userService } from '$lib/core/services/index.js';
import { goto } from '$app/navigation';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import { toast } from '@misiki/kitcommerce-core';

import {
	Save,
	ArrowLeft,
	InfoIcon,
	Loader,
	FileChartColumnIncreasing,
	AlertCircle
} from '@lucide/svelte';

import Textbox from '$lib/components/form/textbox.svelte';
import { z } from 'zod';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let user = {};
		let isLoading = false;
		let detailsChanged = false;
		let loadError = '';

		const schemas = {
			firstName: z.string().min(2, 'First name must be at least 2 characters'),
			lastName: z.string().min(2, 'Last name must be at least 2 characters'),
			email: z.string().email('Please enter a valid email address'),
			phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number').min(9, 'Please enter a valid phone number')
		};

		const loadUser = async () => {
			try {
				user = await userService.getMe();
			} catch(e) {
				loadError = e?.message || 'Could not load your profile. Please sign in and try again.';
			}
		};

		// Ctrl/Cmd+S saves the profile — scoped to this page. Assigning document.onkeydown
		// leaked the handler across every later client-side navigation, so register and
		// tear down properly instead.
		const handleUpdate = async () => {
			try {
				isLoading = true;
				user = await userService.updateProfile(user);
				goto('/profile');
			} catch(e) {
				toast.error(e.message);
			} finally {
				isLoading = false;
				detailsChanged = false;
			}
		};

		const handleDetailsChange = () => {
			detailsChanged = true;
		};

		const onUploadComplete = (urls) => {
			user.avatar = urls[0];
			handleDetailsChange();
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('1eupaib', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Profile</title>`);
				});
			});

			$$renderer.push(`<div class="flex min-h-screen items-center justify-center"><div class="w-full max-w-md transform space-y-6 rounded-xl bg-white p-8 shadow-2xl transition-all dark:bg-gray-800"><div class="space-y-2 text-center"><p class="text-gray-500 dark:text-gray-400">Update Profile Details</p></div> `);

			if (loadError) {
				$$renderer.push(`<!--[0--><div class="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">`);
				AlertCircle($$renderer, { class: 'h-4 w-4 shrink-0' });
				$$renderer.push(`<!----> <span>${$.escape(loadError)}</span></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <form class="grid grid-cols-2 gap-4"><div class="col-span-2"><h2 class="text-1xl font-bold text-gray-900 dark:text-white">Avatar:</h2> <div class="mt-3 flex w-full flex-row items-center justify-start">`);

			LazyImg($$renderer, {
				src: user.avatar,
				alt: `Avatar Image`,
				width: 70,
				height: 70,
				class: 'ml-5 rounded-lg'
			});

			$$renderer.push(`<!----></div></div> `);

			Textbox($$renderer, {
				name: 'firstName',
				placeholder: 'Enter Your First Name',
				schema: schemas.firstName,
				label: 'First Name',
				required: true,
				get value() {
					return user.firstName;
				},

				set value($$value) {
					user.firstName = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Textbox($$renderer, {
				name: 'lastName',
				placeholder: 'Enter Your Last Name',
				schema: schemas.lastName,
				label: 'Last Name',
				required: true,
				get value() {
					return user.lastName;
				},

				set value($$value) {
					user.lastName = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Textbox($$renderer, {
				name: 'email',
				type: 'email',
				placeholder: 'Enter Your Email',
				schema: schemas.email,
				label: 'Email',
				required: true,
				get value() {
					return user.email;
				},

				set value($$value) {
					user.email = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Textbox($$renderer, {
				name: 'phone',
				type: 'tel',
				placeholder: '+1234567890',
				schema: schemas.phone,
				label: 'Phone',
				required: true,
				get value() {
					return user.phone;
				},

				set value($$value) {
					user.phone = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="col-span-2">`);

			Button($$renderer, {
				disabled: isLoading,
				onclick: handleUpdate,
				type: 'submit',
				class: 'flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2',
				children: ($$renderer) => {
					if (isLoading) {
						$$renderer.push('<!--[0-->');
						Loader($$renderer, { class: 'mr-2 h-4 w-4 animate-spin' });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> Update Profile`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></form></div></div> <div class="ease-[cubic-bezier(1,.32,.52,.67)] fixed left-0 right-0 top-10 z-50 mx-auto flex w-1/2 max-w-[1000px] flex-row justify-between rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs font-semibold text-black shadow transition-all duration-150 hover:bg-gray-100"${$.attr_style(detailsChanged ? 'display: flex' : 'display: none')}><div class="flex flex-row items-center gap-2">`);
			InfoIcon($$renderer, { class: 'h-4 w-4' });
			$$renderer.push(`<!----> <span>Unsaved changes</span></div> <button class="rounded bg-white px-2 py-1 text-xs text-black shadow">`);

			if (isLoading) {
				$$renderer.push('<!--[0-->');
				Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
			} else {
				$$renderer.push(`<!--[-1-->Save`);
			}

			$$renderer.push(`<!--]--></button></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}