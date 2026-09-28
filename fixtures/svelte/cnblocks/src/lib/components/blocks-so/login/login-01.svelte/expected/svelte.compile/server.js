import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button";
import { Input } from "$lib/components/ui/input";
import { Label } from "$lib/components/ui/label";
import { Separator } from "$lib/components/ui/separator";
import GoogleIcon from "./google-icon.svelte";

export default function Login_01($$renderer) {
	$$renderer.push(`<div class="flex min-h-screen items-center justify-center"><div class="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6"><div class="sm:mx-auto sm:w-full sm:max-w-sm"><h2 class="text-center text-xl font-semibold text-foreground">Log in or create account</h2> <form action="#" method="post" class="mt-6">`);

	Label($$renderer, {
		for: 'email',
		class: 'font-medium text-foreground',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Email`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Input($$renderer, {
		type: 'email',
		id: 'email',
		name: 'email',
		autocomplete: 'email',
		placeholder: 'john@company.com',
		class: 'mt-2'
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		type: 'submit',
		class: 'mt-4 w-full',
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
		class: 'inline-flex w-full items-center justify-center space-x-2',
		children: ($$renderer) => {
			$$renderer.push(`<a href="/">`);
			GoogleIcon($$renderer, { class: 'size-5', 'aria-hidden': true });
			$$renderer.push(`<!----> <span class="text-sm font-medium">Sign in with Google</span></a>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <p class="mt-4 text-xs text-muted-foreground">By signing in, you agree to our  <a href="/" class="underline underline-offset-4">terms of service</a> 
				and  <a href="/" class="underline underline-offset-4">privacy policy</a> .</p></div></div></div>`);
}