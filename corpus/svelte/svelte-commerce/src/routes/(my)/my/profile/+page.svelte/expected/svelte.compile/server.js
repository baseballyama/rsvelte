import * as $ from 'svelte/internal/server';
import Input from '$lib/components/form/textbox.svelte';
import { Button } from '$lib/components/ui/button';

import {
	Save,
	ArrowLeft,
	InfoIcon,
	Loader,
	User,
	Mail,
	Phone,
	Trash2,
	AlertCircle
} from '@lucide/svelte';

import { goto } from '$app/navigation';
import { MyProfileModule } from '$lib/core/composables/index.js';
import { fly, fade } from 'svelte/transition';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const profileModule = new MyProfileModule();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('17xl71t', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>My Profile | Svelte Commerce</title>`);
				});
			});

			$$renderer.push(`<div class="mx-auto max-w-6xl md:py-8 md:py-12"><div class="space-y-10"><div class="flex items-center justify-between"><div><h1 class="text-lg font-bold tracking-tight text-gray-900 md:text-xl">Profile Settings</h1> <p class="mt-2 text-sm text-gray-500">Manage your personal information and account security.</p></div></div> <div class="overflow-hidden bg-white"><div><form class="space-y-8"><div class="grid grid-cols-1 gap-8 md:grid-cols-2"><div class="space-y-2">`);

			Input($$renderer, {
				label: 'First Name',
				placeholder: 'Enter first name',
				class: 'h-12',
				get value() {
					return profileModule.profile.firstName;
				},

				set value($$value) {
					profileModule.profile.firstName = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="space-y-2">`);

			Input($$renderer, {
				label: 'Last Name',
				placeholder: 'Enter last name',
				class: 'h-12',
				get value() {
					return profileModule.profile.lastName;
				},

				set value($$value) {
					profileModule.profile.lastName = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="space-y-2">`);

			Input($$renderer, {
				id: 'phone',
				name: 'phone',
				label: 'Phone Number',
				type: 'phone',
				placeholder: 'Enter phone number',
				class: 'h-12',
				get value() {
					return profileModule.profile.phone;
				},

				set value($$value) {
					profileModule.profile.phone = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="space-y-2">`);

			Input($$renderer, {
				id: 'email',
				type: 'email',
				name: 'email',
				label: 'Email Address',
				placeholder: 'Enter Email',
				required: true,
				class: 'h-12',
				get value() {
					return profileModule.profile.email;
				},

				set value($$value) {
					profileModule.profile.email = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></div></form></div></div> <div class="overflow-hidden rounded-md border border-red-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]"><div class="border-b border-red-50 bg-red-50/30 p-6 md:p-8"><div class="flex items-center gap-3"><div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">`);
			AlertCircle($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!----></div> <h2 class="text-xl font-bold text-red-600">Danger Zone</h2></div></div> <div class="p-6 md:p-8"><div class="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center"><div class="max-w-md"><h3 class="text-lg font-bold text-gray-900">Delete Account</h3> <p class="mt-1 text-sm text-gray-500">Permanently delete your account and all associated data. This action cannot be undone.</p></div> `);

			Button($$renderer, {
				variant: 'destructive',
				class: 'h-12 px-6',
				onclick: () => goto('/my/profile/delete'),
				children: ($$renderer) => {
					$$renderer.push(`<!---->Request Deletion`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div></div></div></div> `);

			if (profileModule.detailsChanged) {
				$$renderer.push(`<!--[0--><div class="fixed bottom-8 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 px-4"><div class="flex items-center justify-between gap-4 rounded-md border border-gray-200 bg-white/90 p-4 shadow-2xl backdrop-blur-md"><div class="flex items-center gap-3 px-2"><div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">`);
				InfoIcon($$renderer, { class: 'h-4 w-4' });
				$$renderer.push(`<!----></div> <span class="text-sm font-semibold text-gray-900">Unsaved changes</span></div> `);

				Button($$renderer, {
					onclick: profileModule.saveProfile,
					class: 'h-10 px-6',
					children: ($$renderer) => {
						if (profileModule.isLoading) {
							$$renderer.push('<!--[0-->');
							Loader($$renderer, { class: 'mr-2 h-4 w-4 animate-spin' });
							$$renderer.push(`<!----> Saving...`);
						} else {
							$$renderer.push('<!--[-1-->');
							Save($$renderer, { class: 'mr-2 h-4 w-4' });
							$$renderer.push(`<!----> Save Changes`);
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}