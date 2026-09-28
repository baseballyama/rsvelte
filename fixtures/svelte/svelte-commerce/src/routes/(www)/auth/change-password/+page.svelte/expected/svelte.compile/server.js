import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input/input.svelte';
import Button from '$lib/components/ui/button/button.svelte';
import { ChangePasswordModule } from '$lib/core/composables/index.js';
import { Lock, KeyRound, Eye, EyeOff } from '@lucide/svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const changePasswordModule = new ChangePasswordModule();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('157xwrt', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Change Password</title>`);
				});
			});

			$$renderer.push(`<div class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900"><div class="w-full max-w-md transform space-y-6 rounded-xl bg-white p-8 shadow-2xl transition-all dark:bg-gray-800"><div class="text-center"><div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">`);
			KeyRound($$renderer, { class: 'h-6 w-6 text-primary' });
			$$renderer.push(`<!----></div> <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Change Password</h1> <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Please enter your old password and choose a new one</p></div> <form class="space-y-4"><div><label for="old" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Old Password</label> <div class="relative"><div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">`);
			Lock($$renderer, { class: 'h-5 w-5 text-gray-400' });
			$$renderer.push(`<!----></div> `);

			Input($$renderer, {
				id: 'old',
				type: changePasswordModule.showOld ? 'text' : 'password',
				name: 'old',
				placeholder: 'Enter your current password',
				required: true,
				class: 'pl-10 pr-10',
				get value() {
					return changePasswordModule.old;
				},

				set value($$value) {
					changePasswordModule.old = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <button type="button" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500">`);

			if (changePasswordModule.showOld) {
				$$renderer.push('<!--[0-->');
				EyeOff($$renderer, { class: 'h-5 w-5' });
			} else {
				$$renderer.push('<!--[-1-->');
				Eye($$renderer, { class: 'h-5 w-5' });
			}

			$$renderer.push(`<!--]--></button></div> `);

			if (changePasswordModule.errors.old && changePasswordModule.old.length > 0) {
				$$renderer.push(`<!--[0--><p class="mt-1 text-sm text-red-500">${$.escape(changePasswordModule.errors.old)}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div><label for="password" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label> <div class="relative"><div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">`);
			Lock($$renderer, { class: 'h-5 w-5 text-gray-400' });
			$$renderer.push(`<!----></div> `);

			Input($$renderer, {
				id: 'password',
				type: changePasswordModule.showNew ? 'text' : 'password',
				name: 'password',
				placeholder: 'Enter your new password',
				required: true,
				class: 'pl-10 pr-10',
				get value() {
					return changePasswordModule.password;
				},

				set value($$value) {
					changePasswordModule.password = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <button type="button" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500">`);

			if (changePasswordModule.showNew) {
				$$renderer.push('<!--[0-->');
				EyeOff($$renderer, { class: 'h-5 w-5' });
			} else {
				$$renderer.push('<!--[-1-->');
				Eye($$renderer, { class: 'h-5 w-5' });
			}

			$$renderer.push(`<!--]--></button></div> `);

			if (changePasswordModule.errors.password && changePasswordModule.password.length > 0) {
				$$renderer.push(`<!--[0--><p class="mt-1 text-sm text-red-500">${$.escape(changePasswordModule.errors.password)}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div><label for="retype" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label> <div class="relative"><div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">`);
			Lock($$renderer, { class: 'h-5 w-5 text-gray-400' });
			$$renderer.push(`<!----></div> `);

			Input($$renderer, {
				id: 'retype',
				type: changePasswordModule.showRetype ? 'text' : 'password',
				name: 'retype',
				placeholder: 'Confirm your new password',
				required: true,
				class: 'pl-10 pr-10',
				get value() {
					return changePasswordModule.retype;
				},

				set value($$value) {
					changePasswordModule.retype = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <button type="button" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500">`);

			if (changePasswordModule.showRetype) {
				$$renderer.push('<!--[0-->');
				EyeOff($$renderer, { class: 'h-5 w-5' });
			} else {
				$$renderer.push('<!--[-1-->');
				Eye($$renderer, { class: 'h-5 w-5' });
			}

			$$renderer.push(`<!--]--></button></div> `);

			if (changePasswordModule.errors.retype && changePasswordModule.retype.length > 0) {
				$$renderer.push(`<!--[0--><p class="mt-1 text-sm text-red-500">${$.escape(changePasswordModule.errors.retype)}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			Button($$renderer, {
				type: 'submit',
				class: 'w-full',
				disabled: !changePasswordModule.isValid || changePasswordModule.loading,
				children: ($$renderer) => {
					if (changePasswordModule.loading) {
						$$renderer.push(`<!--[0--><div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> ${$.escape(changePasswordModule.loading ? 'Changing Password...' : 'Change Password')}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></form></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}