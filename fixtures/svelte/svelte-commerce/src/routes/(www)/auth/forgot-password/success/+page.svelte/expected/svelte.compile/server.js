import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button/index.js';
import { Mail } from '@lucide/svelte';
import AuthButton from '$lib/components/auth/auth-button.svelte';

export default function _page($$renderer) {
	$.head('xmrv2a', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Forgot Password</title>`);
		});
	});

	$$renderer.push(`<div class="container mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col items-center justify-center px-4"><div class="w-full space-y-6 text-center"><div class="flex flex-col items-center space-y-4"><div class="rounded-full bg-gray-100 p-3">`);
	Mail($$renderer, { class: 'h-6 w-6 text-gray-600' });
	$$renderer.push(`<!----></div> <div class="space-y-2"><h1 class="text-2xl font-bold tracking-tight">Check your email</h1> <p class="text-gray-500">We've sent you a password reset link. Please check your email and follow the instructions to reset your password.</p></div></div> <div class="space-y-4">`);

	AuthButton($$renderer, {
		type: 'login',
		children: ($$renderer) => {
			Button($$renderer, {
				variant: 'outline',
				class: 'w-full',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Back to Login`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></div>`);
}