import * as $ from 'svelte/internal/server';
import { Bolt as Logo } from "$lib/svgs/index";
import { Button } from "$lib/components/ui/veil/button";
import { Card } from "$lib/components/ui/veil/card";
import { Input } from "$lib/components/ui/veil/input";
import { Label } from "$lib/components/ui/label";

export default function Forgot_password_one($$renderer) {
	$$renderer.push(`<section class="flex grid min-h-screen grid-rows-[auto_1fr] bg-background px-4"><div class="mx-auto w-full max-w-7xl border-b py-3">`);

	Button($$renderer, {
		href: '/',
		'aria-label': 'go home',
		variant: 'ghost',
		size: 'sm',
		class: 'inline-block h-auto border-t-2 border-transparent py-3 hover:bg-transparent',
		children: ($$renderer) => {
			Logo($$renderer, { class: 'w-fit' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="m-auto w-full max-w-sm"><div class="text-center"><h1 class="font-serif text-4xl font-medium">Forgot password?</h1> <p class="mt-2 text-sm text-muted-foreground">Enter your email and we'll send you a reset link</p></div> `);

	Card($$renderer, {
		variant: 'outline',
		class: 'mt-6 p-8',
		children: ($$renderer) => {
			$$renderer.push(`<form action="" class="space-y-5"><div class="space-y-3">`);

			Label($$renderer, {
				for: 'email',
				class: 'text-sm',
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
				placeholder: 'you@example.com',
				required: true
			});

			$$renderer.push(`<!----></div> `);

			Button($$renderer, {
				class: 'w-full',
				type: 'submit',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Send Reset Link`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></form>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <p class="mt-6 text-center text-sm text-muted-foreground">Remember your password? `);

	Button($$renderer, {
		href: '/',
		variant: 'link',
		class: 'px-1 font-medium text-primary',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Sign in`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></p></div></section>`);
}