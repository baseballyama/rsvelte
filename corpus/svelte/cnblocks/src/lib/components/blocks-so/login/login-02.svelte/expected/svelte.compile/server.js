import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button";
import { Input } from "$lib/components/ui/input";
import { Label } from "$lib/components/ui/label";
import { Separator } from "$lib/components/ui/separator";
import GoogleIcon from "./google-icon.svelte";

export default function Login_02($$renderer) {
	$$renderer.push(`<div class="flex min-h-screen items-center justify-center"><div class="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6"><div class="sm:mx-auto sm:w-full sm:max-w-sm"><h2 class="text-center text-xl font-semibold text-foreground">Log in or create account</h2> <form action="#" method="post" class="mt-6 space-y-4"><div>`);

	Label($$renderer, {
		for: 'email-login-02',
		class: 'text-sm font-medium text-foreground dark:text-foreground',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Email`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Input($$renderer, {
		type: 'email',
		id: 'email-login-02',
		name: 'email-login-02',
		autocomplete: 'email',
		placeholder: 'ephraim@blocks.so',
		class: 'mt-2'
	});

	$$renderer.push(`<!----></div> <div>`);

	Label($$renderer, {
		for: 'password-login-02',
		class: 'text-sm font-medium text-foreground dark:text-foreground',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Password`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Input($$renderer, {
		type: 'password',
		id: 'password-login-02',
		name: 'password-login-02',
		autocomplete: 'current-password',
		placeholder: '**************',
		class: 'mt-2'
	});

	$$renderer.push(`<!----></div> `);

	Button($$renderer, {
		type: 'submit',
		class: 'mt-4 w-full py-2 font-medium',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Sign in`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></form> <div class="relative my-6"><div class="absolute inset-0 flex items-center">`);
	Separator($$renderer, { class: 'w-full' });
	$$renderer.push(`<!----></div> <div class="relative flex justify-center text-xs uppercase"><span class="bg-background px-2 text-muted-foreground">or with</span></div></div> `);

	Button($$renderer, {
		variant: 'outline',
		class: 'flex w-full items-center justify-center space-x-2 py-2',
		href: '/',
		children: ($$renderer) => {
			GoogleIcon($$renderer, { class: 'size-5', 'aria-hidden': 'true' });
			$$renderer.push(`<!----> <span class="text-sm font-medium">Sign in with Google</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <p class="mt-4 text-xs text-muted-foreground dark:text-muted-foreground">By signing in, you agree to our  <a href="/" class="underline underline-offset-4">terms of service</a> 
				and  <a href="/" class="underline underline-offset-4">privacy policy</a> .</p></div></div></div>`);
}