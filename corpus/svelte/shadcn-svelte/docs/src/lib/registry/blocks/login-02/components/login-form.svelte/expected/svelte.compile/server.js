import * as $ from 'svelte/internal/server';
import { Button } from "$lib/registry/ui/button/index.js";

import {
	FieldGroup,
	Field,
	FieldLabel,
	FieldDescription,
	FieldSeparator
} from "$lib/registry/ui/field/index.js";

import { Input } from "$lib/registry/ui/input/index.js";
import { cn } from "$lib/utils.js";

export default function Login_form($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = $.props_id($$renderer);

		let {
			ref = null,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<form${$.attributes({
			class: $.clsx(cn("flex flex-col gap-6", className)),
			...restProps
		})}>`);

		FieldGroup($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex flex-col items-center gap-1 text-center"><h1 class="text-2xl font-bold">Login to your account</h1> <p class="text-sm text-balance text-muted-foreground">Enter your email below to login to your account</p></div> `);

				Field($$renderer, {
					children: ($$renderer) => {
						FieldLabel($$renderer, {
							for: `email-${id}`,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Email`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Input($$renderer, {
							id: `email-${id}`,
							type: 'email',
							placeholder: 'm@example.com',
							required: true
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Field($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="flex items-center">`);

						FieldLabel($$renderer, {
							for: `password-${id}`,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Password`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <a href="##" class="ms-auto text-sm underline-offset-4 hover:underline">Forgot your password?</a></div> `);
						Input($$renderer, { id: `password-${id}`, type: 'password', required: true });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Field($$renderer, {
					children: ($$renderer) => {
						Button($$renderer, {
							type: 'submit',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Login`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				FieldSeparator($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Or continue with`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Field($$renderer, {
					children: ($$renderer) => {
						Button($$renderer, {
							variant: 'outline',
							type: 'button',
							children: ($$renderer) => {
								$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="currentColor"></path></svg> Login with GitHub`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						FieldDescription($$renderer, {
							class: 'text-center',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Don't have an account? <a href="##" class="underline underline-offset-4">Sign up</a>`);
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

		$$renderer.push(`<!----></form>`);
		$.bind_props($$props, { ref });
	});
}