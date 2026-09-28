import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button";
import { Card, CardContent } from "$lib/components/ui/card";
import { Checkbox } from "$lib/components/ui/checkbox";
import { Input } from "$lib/components/ui/input";
import { Label } from "$lib/components/ui/label";
import LogoIcon from "./logo-icon.svelte";

export default function Login_05($$renderer) {
	$$renderer.push(`<div class="flex min-h-screen items-center justify-center"><div class="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6"><div class="sm:mx-auto sm:w-full sm:max-w-md">`);

	LogoIcon($$renderer, {
		class: 'mx-auto h-10 w-10 text-foreground dark:text-foreground',
		'aria-hidden': 'true'
	});

	$$renderer.push(`<!----> <h3 class="mt-2 text-center text-lg font-bold text-foreground dark:text-foreground">Create new account for workspace</h3></div> `);

	Card($$renderer, {
		class: 'mt-4 sm:mx-auto sm:w-full sm:max-w-md',
		children: ($$renderer) => {
			CardContent($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<form action="#" method="post" class="space-y-4"><div>`);

					Label($$renderer, {
						for: 'name-login-05',
						class: 'text-sm font-medium text-foreground dark:text-foreground',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Name`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Input($$renderer, {
						type: 'text',
						id: 'name-login-05',
						name: 'name-login-05',
						autocomplete: 'name',
						placeholder: 'Name',
						class: 'mt-2'
					});

					$$renderer.push(`<!----></div> <div>`);

					Label($$renderer, {
						for: 'email-login-05',
						class: 'text-sm font-medium text-foreground dark:text-foreground',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Email`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Input($$renderer, {
						type: 'email',
						id: 'email-login-05',
						name: 'email-login-05',
						autocomplete: 'email',
						placeholder: 'ephraim@blocks.so',
						class: 'mt-2'
					});

					$$renderer.push(`<!----></div> <div>`);

					Label($$renderer, {
						for: 'password-login-05',
						class: 'text-sm font-medium text-foreground dark:text-foreground',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Password`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Input($$renderer, {
						type: 'password',
						id: 'password-login-05',
						name: 'password-login-05',
						autocomplete: 'new-password',
						placeholder: 'Password',
						class: 'mt-2'
					});

					$$renderer.push(`<!----></div> <div>`);

					Label($$renderer, {
						for: 'confirm-password-login-05',
						class: 'text-sm font-medium text-foreground dark:text-foreground',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Confirm password`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Input($$renderer, {
						type: 'password',
						id: 'confirm-password-login-05',
						name: 'confirm-password-login-05',
						autocomplete: 'new-password',
						placeholder: 'Password',
						class: 'mt-2'
					});

					$$renderer.push(`<!----></div> <div class="mt-2 flex items-start"><div class="flex h-6 items-center">`);

					Checkbox($$renderer, {
						id: 'newsletter-login-05',
						name: 'newsletter-login-05',
						class: 'size-4'
					});

					$$renderer.push(`<!----></div> `);

					Label($$renderer, {
						for: 'newsletter-login-05',
						class: 'ml-3 text-sm leading-6 text-muted-foreground dark:text-muted-foreground',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Sign up to our newsletter`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div> `);

					Button($$renderer, {
						type: 'submit',
						class: 'mt-4 w-full py-2 font-medium',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Create account`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <p class="text-center text-xs text-muted-foreground dark:text-muted-foreground">By signing in, you agree to our  <a href="/" class="text-primary capitalize hover:text-primary/90 dark:text-primary hover:dark:text-primary/90">Terms of use</a> 
						and  <a href="/" class="text-primary capitalize hover:text-primary/90 dark:text-primary hover:dark:text-primary/90">Privacy policy</a></p></form>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <p class="mt-6 text-center text-sm text-muted-foreground dark:text-muted-foreground">Already have an account?  <a href="/" class="font-medium text-primary hover:text-primary/90 dark:text-primary hover:dark:text-primary/90">Sign in</a></p></div></div>`);
}