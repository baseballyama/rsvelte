import * as $ from 'svelte/internal/server';
import GithubIcon from "$lib/components/github.svelte";
import SpinnerIcon from "$lib/components/spinner.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import { cn } from "$lib/utils.js";

export default function User_auth_form($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...restProps } = $$props;
		let isLoading = false;

		async function onSubmit(e) {
			e.preventDefault();
			isLoading = true;

			setTimeout(
				() => {
					isLoading = false;
				},
				3000
			);
		}

		$$renderer.push(`<div${$.attributes({ class: $.clsx(cn("grid gap-6", className)), ...restProps })}><form><div class="grid gap-2"><div class="grid gap-1">`);

		Label($$renderer, {
			class: 'sr-only',
			for: 'email',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Email`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Input($$renderer, {
			id: 'email',
			placeholder: 'name@example.com',
			type: 'email',
			autocapitalize: 'none',
			autocomplete: 'email',
			autocorrect: 'off',
			disabled: isLoading
		});

		$$renderer.push(`<!----></div> `);

		Button($$renderer, {
			disabled: isLoading,
			children: ($$renderer) => {
				if (isLoading) {
					$$renderer.push('<!--[0-->');
					SpinnerIcon($$renderer, { class: 'me-2 size-4 animate-spin' });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> Sign In with Email`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></form> <div class="relative"><div class="absolute inset-0 flex items-center"><span class="w-full border-t"></span></div> <div class="relative flex justify-center text-xs uppercase"><span class="bg-background px-2 text-muted-foreground">Or continue with</span></div></div> `);

		Button($$renderer, {
			variant: 'outline',
			type: 'button',
			disabled: isLoading,
			children: ($$renderer) => {
				if (isLoading) {
					$$renderer.push('<!--[0-->');
					SpinnerIcon($$renderer, { class: 'me-2 size-4 animate-spin' });
				} else {
					$$renderer.push('<!--[-1-->');
					GithubIcon($$renderer, { class: 'me-2 size-4' });
				}

				$$renderer.push(`<!--]--> GitHub`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}