import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button";
import { Checkbox } from "$lib/components/ui/checkbox";
import { Input } from "$lib/components/ui/input";
import { Label } from "$lib/components/ui/label";
import { Separator } from "$lib/components/ui/separator";
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import Eye from "@lucide/svelte/icons/eye";
import EyeOff from "@lucide/svelte/icons/eye-off";
import Lock from "@lucide/svelte/icons/lock";
import Mail from "@lucide/svelte/icons/mail";
import GoogleIcon from "./google-icon.svelte";
import LogoIcon from "./logo-icon.svelte";

export default function Login_07($$renderer) {
	let isVisible = false;

	const toggleVisibility = () => {
		isVisible = !isVisible;
	};

	$$renderer.push(`<div class="flex min-h-screen items-center justify-center"><div class="mx-auto w-full max-w-xs space-y-6"><div class="space-y-2 text-center">`);
	LogoIcon($$renderer, { class: 'mx-auto h-16 w-16' });
	$$renderer.push(`<!----> <h1 class="text-3xl font-semibold">Welcome back</h1> <p class="text-muted-foreground">Sign in to access to your dashboard, settings and projects.</p></div> <div class="space-y-5">`);

	Button($$renderer, {
		variant: 'outline',
		class: 'w-full justify-center gap-2',
		children: ($$renderer) => {
			GoogleIcon($$renderer, { class: 'h-4 w-4' });
			$$renderer.push(`<!----> Sign in with Google`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="flex items-center gap-2">`);
	Separator($$renderer, { class: 'flex-1' });
	$$renderer.push(`<!----> <span class="text-sm text-muted-foreground">or sign in with email</span> `);
	Separator($$renderer, { class: 'flex-1' });
	$$renderer.push(`<!----></div> <div class="space-y-6"><div>`);

	Label($$renderer, {
		for: 'email',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Email`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="relative mt-2.5">`);

	Input($$renderer, {
		id: 'email',
		class: 'peer ps-9',
		placeholder: 'ephraim@blocks.so',
		type: 'email'
	});

	$$renderer.push(`<!----> <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">`);
	Mail($$renderer, { size: 16, 'aria-hidden': 'true' });
	$$renderer.push(`<!----></div></div></div> <div><div class="flex items-center justify-between">`);

	Label($$renderer, {
		for: 'password',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Password`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <a href="/" class="text-sm text-primary hover:underline">Forgot Password?</a></div> <div class="relative mt-2.5">`);

	Input($$renderer, {
		id: 'password',
		class: 'ps-9 pe-9',
		placeholder: 'Enter your password',
		type: isVisible ? "text" : "password"
	});

	$$renderer.push(`<!----> <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">`);
	Lock($$renderer, { size: 16, 'aria-hidden': 'true' });
	$$renderer.push(`<!----></div> <button class="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" type="button"${$.attr('aria-label', isVisible ? "Hide password" : "Show password")}${$.attr('aria-pressed', isVisible)} aria-controls="password">`);

	if (isVisible) {
		$$renderer.push('<!--[0-->');
		EyeOff($$renderer, { size: 16, 'aria-hidden': 'true' });
	} else {
		$$renderer.push('<!--[-1-->');
		Eye($$renderer, { size: 16, 'aria-hidden': 'true' });
	}

	$$renderer.push(`<!--]--></button></div></div> <div class="flex items-center gap-2 pt-1">`);
	Checkbox($$renderer, { id: 'remember-me' });
	$$renderer.push(`<!----> `);

	Label($$renderer, {
		for: 'remember-me',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Remember for 30 days`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div> `);

	Button($$renderer, {
		class: 'w-full',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Sign in `);
			ArrowRight($$renderer, { class: 'h-4 w-4' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="text-center text-sm">No account?  <a href="/" class="font-medium text-primary hover:underline">Create an account</a></div></div></div></div>`);
}