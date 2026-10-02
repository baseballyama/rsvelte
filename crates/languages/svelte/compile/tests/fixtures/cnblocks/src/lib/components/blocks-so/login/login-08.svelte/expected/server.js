import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "$lib/components/ui/card";
import { Checkbox } from "$lib/components/ui/checkbox";
import { Input } from "$lib/components/ui/input";
import { Label } from "$lib/components/ui/label";
import EyeIcon from "@lucide/svelte/icons/eye";
import EyeOffIcon from "@lucide/svelte/icons/eye-off";
import Key from "@lucide/svelte/icons/key";
import LogoIcon from "./logo-icon.svelte";

export default function Login_08($$renderer) {
	let isPasswordVisible = false;

	const togglePasswordVisibility = () => {
		isPasswordVisible = !isPasswordVisible;
	};

	$$renderer.push(`<div class="flex min-h-screen items-center justify-center">`);

	Card($$renderer, {
		class: 'mx-4 w-full max-w-md pb-0',
		children: ($$renderer) => {
			CardHeader($$renderer, {
				class: 'mt-4 mb-2 space-y-1 text-center',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex justify-center">`);
					LogoIcon($$renderer, {});
					$$renderer.push(`<!----></div> <div><h2 class="text-2xl font-semibold">Sign in to Acme</h2> <p class="text-sm text-muted-foreground">Welcome back! Please enter your details.</p></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				class: 'space-y-6',
				children: ($$renderer) => {
					$$renderer.push(`<div class="space-y-2">`);

					Label($$renderer, {
						for: 'email',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Email address`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					Input($$renderer, { id: 'email', type: 'email', placeholder: 'ephraim@blocks.so' });
					$$renderer.push(`<!----></div> <div class="space-y-0"><div class="mb-2 flex items-center justify-between">`);

					Label($$renderer, {
						for: 'password',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Password`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <a href="/" class="text-sm text-primary hover:underline">Reset password</a></div> <div class="relative">`);

					Input($$renderer, {
						id: 'password',
						class: 'pe-9',
						placeholder: 'Enter your password',
						type: isPasswordVisible ? "text" : "password"
					});

					$$renderer.push(`<!----> <button class="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" type="button"${$.attr('aria-label', isPasswordVisible ? "Hide password" : "Show password")}${$.attr('aria-pressed', isPasswordVisible)} aria-controls="password">`);

					if (isPasswordVisible) {
						$$renderer.push('<!--[0-->');
						EyeOffIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
					} else {
						$$renderer.push('<!--[-1-->');
						EyeIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
					}

					$$renderer.push(`<!--]--></button></div></div> <div class="flex items-center space-x-2">`);
					Checkbox($$renderer, { id: 'remember', checked: true });
					$$renderer.push(`<!----> `);

					Label($$renderer, {
						for: 'remember',
						class: 'text-sm font-normal',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Remember me`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div> <div class="space-y-2">`);

					Button($$renderer, {
						class: 'w-full',
						type: 'submit',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Sign In`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant: 'outline',
						class: 'w-full',
						type: 'button',
						children: ($$renderer) => {
							Key($$renderer, { class: 'mr-2 h-4 w-4' });
							$$renderer.push(`<!----> Single sign-on (SSO)`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardFooter($$renderer, {
				class: 'flex justify-center border-t py-4!',
				children: ($$renderer) => {
					$$renderer.push(`<p class="text-center text-sm text-muted-foreground">New to Acme?  <a href="/" class="text-primary hover:underline">Sign up</a></p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}