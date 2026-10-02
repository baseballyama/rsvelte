import * as $ from 'svelte/internal/server';
import { LoaderIcon } from '@lucide/svelte';
import Button from '$lib/components/ui/button/button.svelte';
import Textbox from '$lib/components/form/textbox.svelte';
import AuthButton from '$lib/components/auth/auth-button.svelte';
import { ForgotPasswordModule, forgotPasswordSchema as schemas } from '$lib/core/composables/index.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const forgotPasswordModule = new ForgotPasswordModule();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('1jwg7wm', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Forgot Password</title>`);
				});
			});

			$$renderer.push(`<div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"><div class="-mt-24 flex w-full items-center justify-center gap-8 p-4"><div class="w-full max-w-md transform space-y-6 rounded-lg border bg-white/80 p-8 backdrop-blur-sm transition-all dark:bg-gray-800/90"><div class="space-y-2 text-center"><h2 class="text-2xl font-bold text-gray-900 dark:text-white">Forgot Password?</h2> <p class="text-gray-500 dark:text-gray-400">Enter your email to receive reset instructions</p></div> <form class="space-y-4">`);

			Textbox($$renderer, {
				name: 'email',
				type: 'email',
				placeholder: 'swadesh@litekrat.in',
				schema: schemas.email,
				label: 'Email',
				required: true,
				get value() {
					return forgotPasswordModule.email;
				},

				set value($$value) {
					forgotPasswordModule.email = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				type: 'submit',
				class: 'w-full',
				disabled: forgotPasswordModule.isLoading,
				children: ($$renderer) => {
					if (forgotPasswordModule.isLoading) {
						$$renderer.push('<!--[0-->');
						LoaderIcon($$renderer, { class: 'mr-2 h-4 w-4 animate-spin' });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> Send Reset Link`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></form> <div class="relative"><div class="absolute inset-0 flex items-center"><span class="w-full border-t"></span></div> <div class="relative flex justify-center text-xs uppercase"><span class="bg-white px-2 text-gray-500 dark:bg-gray-800">Or</span></div></div> <div class="text-center">`);

			AuthButton($$renderer, {
				type: 'login',
				children: ($$renderer) => {
					Button($$renderer, {
						variant: 'link',
						class: 'inline-flex items-center text-sm text-gray-600 hover:text-gray-500',
						children: ($$renderer) => {
							$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg> Back to Login`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}