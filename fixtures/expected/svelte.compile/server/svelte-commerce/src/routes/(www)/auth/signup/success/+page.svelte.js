import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import AuthButton from '$lib/components/auth/auth-button.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$.head('1a9m7ih', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Signup Success - ${$.escape(page?.data?.store?.name || '')}</title>`);
			});

			$$renderer.push(`<meta name="description" content="Thank you for signing up! Please verify your email to complete registration."/>`);
		});

		$$renderer.push(`<div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4 dark:from-gray-900 dark:to-gray-800"><div class="w-full max-w-md space-y-8 rounded-lg bg-white/80 p-8 text-center shadow-xl backdrop-blur-sm dark:bg-gray-800/90"><div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20"><svg class="h-10 w-10 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div> <div class="space-y-4"><h1 class="text-3xl font-bold text-gray-900 dark:text-white">Welcome aboard!</h1> <p class="text-lg text-gray-600 dark:text-gray-300">Hi ${$.escape(page.url.searchParams.get('email'))}, Thank you for creating an account with ${$.escape(page?.data?.store?.name)}. Please verify your email to
				complete registration.</p></div> <div class="rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20"><h2 class="mb-4 text-xl font-semibold text-blue-900 dark:text-blue-100">Verify your email</h2> <p class="text-blue-700 dark:text-blue-200">We've sent a verification link to <span class="font-medium">${$.escape(page.url.searchParams.get('email'))}</span></p> <p class="mt-2 text-sm text-blue-600 dark:text-blue-300">Please check your inbox and click the link to activate your account.</p></div> <div class="space-y-4 pt-4"><p class="text-sm text-gray-500 dark:text-gray-400">Didn't receive the email? Check your spam folder</p> <div class="space-y-2"><button class="inline-block w-full rounded-lg bg-gray-900 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600">Continue Shopping</button></div></div></div></div>`);
	});
}