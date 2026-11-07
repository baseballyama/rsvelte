import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button";
import { Card, CardContent } from "$lib/components/ui/card";
import { Input } from "$lib/components/ui/input";
import { Separator } from "$lib/components/ui/separator";
import LogoIcon from "./logo-icon.svelte";

export default function Login_06($$renderer) {
	$$renderer.push(`<div class="flex min-h-screen items-center justify-center">`);

	Card($$renderer, {
		class: 'w-full max-w-sm rounded-4xl px-6 py-10 pt-14',
		children: ($$renderer) => {
			CardContent($$renderer, {
				class: '',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-col items-center space-y-8">`);
					LogoIcon($$renderer, {});
					$$renderer.push(`<!----> <div class="space-y-2 text-center"><h1 class="text-3xl font-semibold text-foreground">Welcome back!</h1> <p class="text-sm text-muted-foreground">First time here?  <a href="/" class="text-foreground hover:underline">Sign up for free</a></p></div> <div class="w-full space-y-4">`);

					Input($$renderer, {
						type: 'email',
						placeholder: 'Your email',
						class: 'w-full rounded-xl'
					});

					$$renderer.push(`<!----> <div class="flex flex-col gap-2">`);

					Button($$renderer, {
						class: 'w-full rounded-xl',
						size: 'lg',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Send me the magic link`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant: 'link',
						class: 'w-full text-sm text-muted-foreground',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Sign in using password`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div> <div class="flex items-center gap-4 py-2">`);
					Separator($$renderer, { class: 'flex-1' });
					$$renderer.push(`<!----> <span class="text-sm text-muted-foreground">OR</span> `);
					Separator($$renderer, { class: 'flex-1' });
					$$renderer.push(`<!----></div> `);

					Button($$renderer, {
						variant: 'outline',
						class: 'w-full rounded-xl',
						size: 'lg',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Single sign-on (SSO)`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div> <p class="w-11/12 text-center text-xs text-muted-foreground">You acknowledge that you read, and agree, to our  <a href="/" class="underline hover:text-foreground">Terms of Service</a> 
					and our  <a href="/" class="underline hover:text-foreground">Privacy Policy</a> .</p></div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}