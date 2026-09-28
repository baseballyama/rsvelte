import * as $ from 'svelte/internal/server';
import { Bolt as Logo } from "$lib/svgs/index";
import { Button } from "$lib/components/ui/veil/button";
import { Input } from "$lib/components/ui/veil/input";
import { Label } from "$lib/components/ui/label";

export default function Forgot_password_three($$renderer) {
	$$renderer.push(`<section class="flex min-h-screen bg-background px-4 py-16 md:py-24"><div class="m-auto w-full max-w-xs"><div class="text-center">`);

	Button($$renderer, {
		href: '/',
		'aria-label': 'go home',
		variant: 'ghost',
		size: 'sm',
		class: 'inline-block h-auto py-3 hover:bg-transparent',
		children: ($$renderer) => {
			Logo($$renderer, { class: 'mx-auto w-fit' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h1 class="mt-3 font-serif text-4xl font-medium">Reset password</h1></div> <form action="" class="mt-12 space-y-4"><div class="space-y-2">`);

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

	$$renderer.push(`<!----></form> <p class="mt-8 text-center text-sm text-muted-foreground">Remember your password? `);

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