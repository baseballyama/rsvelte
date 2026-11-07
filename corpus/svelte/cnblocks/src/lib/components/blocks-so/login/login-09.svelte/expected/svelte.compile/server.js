import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "$lib/components/ui/card";
import { Checkbox } from "$lib/components/ui/checkbox";
import { Input } from "$lib/components/ui/input";
import { Label } from "$lib/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "$lib/components/ui/select";
import BarChart from "@lucide/svelte/icons/bar-chart";
import Code from "@lucide/svelte/icons/code";
import Eye from "@lucide/svelte/icons/eye";
import EyeOff from "@lucide/svelte/icons/eye-off";
import User from "@lucide/svelte/icons/user";
import LogoIcon from "./logo-icon.svelte";

export default function Login_09($$renderer) {
	let showPassword = false;

	$$renderer.push(`<div class="flex min-h-screen items-center justify-center"><div class="w-full max-w-md">`);

	Card($$renderer, {
		class: 'border-none pb-0 shadow-lg',
		children: ($$renderer) => {
			CardHeader($$renderer, {
				class: 'flex flex-col items-center space-y-1.5 pt-6 pb-4',
				children: ($$renderer) => {
					LogoIcon($$renderer, { class: 'h-12 w-12' });
					$$renderer.push(`<!----> <div class="flex flex-col items-center space-y-0.5"><h2 class="text-2xl font-semibold text-foreground">Create an account</h2> <p class="text-muted-foreground">Welcome! Create an account to get started.</p></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				class: 'space-y-6 px-8',
				children: ($$renderer) => {
					$$renderer.push(`<div class="space-y-2">`);

					Label($$renderer, {
						for: 'role',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Role`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Select($$renderer, {
						value: 'designer',
						type: 'single',
						children: ($$renderer) => {
							SelectTrigger($$renderer, {
								id: 'role',
								class: '[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0',
								children: ($$renderer) => {
									$$renderer.push(`<span>Select role</span>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							SelectContent($$renderer, {
								class: '[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0',
								children: ($$renderer) => {
									SelectItem($$renderer, {
										value: 'designer',
										children: ($$renderer) => {
											User($$renderer, { size: 16, 'aria-hidden': 'true' });
											$$renderer.push(`<!----> <span class="truncate">Product Designer</span>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									SelectItem($$renderer, {
										value: 'developer',
										children: ($$renderer) => {
											Code($$renderer, { size: 16, 'aria-hidden': 'true' });
											$$renderer.push(`<!----> <span class="truncate">Developer</span>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									SelectItem($$renderer, {
										value: 'manager',
										children: ($$renderer) => {
											BarChart($$renderer, { size: 16, 'aria-hidden': 'true' });
											$$renderer.push(`<!----> <span class="truncate">Product Manager</span>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div> <div class="grid grid-cols-2 gap-4"><div class="space-y-2">`);

					Label($$renderer, {
						for: 'firstName',
						children: ($$renderer) => {
							$$renderer.push(`<!---->First name`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					Input($$renderer, { id: 'firstName' });
					$$renderer.push(`<!----></div> <div class="space-y-2">`);

					Label($$renderer, {
						for: 'lastName',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Last name`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					Input($$renderer, { id: 'lastName' });
					$$renderer.push(`<!----></div></div> <div class="space-y-2">`);

					Label($$renderer, {
						for: 'username',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Username`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					Input($$renderer, { id: 'username' });
					$$renderer.push(`<!----></div> <div class="space-y-2">`);

					Label($$renderer, {
						for: 'email',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Email address`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					Input($$renderer, { id: 'email', type: 'email' });
					$$renderer.push(`<!----></div> <div class="space-y-2">`);

					Label($$renderer, {
						for: 'password',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Password`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <div class="relative">`);

					Input($$renderer, {
						id: 'password',
						type: showPassword ? "text" : "password",
						class: 'pr-10'
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						type: 'button',
						variant: 'ghost',
						size: 'icon',
						class: 'absolute top-0 right-0 h-full px-3 text-muted-foreground hover:bg-transparent',
						onclick: () => showPassword = !showPassword,
						children: ($$renderer) => {
							if (showPassword) {
								$$renderer.push('<!--[0-->');
								EyeOff($$renderer, { class: 'h-4 w-4' });
							} else {
								$$renderer.push('<!--[-1-->');
								Eye($$renderer, { class: 'h-4 w-4' });
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div></div> <div class="flex items-center space-x-2">`);
					Checkbox($$renderer, { id: 'terms' });

					$$renderer.push(`<!----> <label for="terms" class="text-sm text-muted-foreground">I agree to the  <a href="/" class="text-primary hover:underline">Terms</a> 
						and  <a href="/" class="text-primary hover:underline">Conditions</a></label></div> `);

					Button($$renderer, {
						class: 'w-full bg-primary text-primary-foreground',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Create free account`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardFooter($$renderer, {
				class: 'flex justify-center border-t py-4!',
				children: ($$renderer) => {
					$$renderer.push(`<p class="text-center text-sm text-muted-foreground">Already have an account?  <a href="/" class="text-primary hover:underline">Sign in</a></p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div>`);
}