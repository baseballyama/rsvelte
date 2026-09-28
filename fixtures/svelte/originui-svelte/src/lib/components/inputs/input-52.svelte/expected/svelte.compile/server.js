import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import { usePasswordStrength } from '$lib/hooks/use-password-strength.svelte';
import { cn } from '$lib/utils.js';
import Check from '@lucide/svelte/icons/check';
import Eye from '@lucide/svelte/icons/eye';
import EyeOff from '@lucide/svelte/icons/eye-off';
import X from '@lucide/svelte/icons/x';

export default function Input_52($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);
		const passwordStrength = usePasswordStrength({ id: uid });
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div><div class="*:not-first:mt-2">`);

			Label($$renderer, {
				for: uid,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Input with password strength indicator`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="relative">`);

			Input($$renderer, {
				id: passwordStrength.id,
				class: 'pe-9',
				placeholder: 'Password',
				type: passwordStrength.isVisible ? 'text' : 'password',
				'aria-describedby': passwordStrength.id,
				get value() {
					return passwordStrength.password;
				},

				set value($$value) {
					passwordStrength.password = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <button class="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" type="button"${$.attr('aria-label', passwordStrength.isVisible ? 'Hide password' : 'Show password')}${$.attr('aria-pressed', passwordStrength.isVisible)}${$.attr('aria-controls', passwordStrength.id)}>`);

			if (passwordStrength.isVisible) {
				$$renderer.push('<!--[0-->');
				EyeOff($$renderer, { size: 16, 'aria-hidden': 'true' });
			} else {
				$$renderer.push('<!--[-1-->');
				Eye($$renderer, { size: 16, 'aria-hidden': 'true' });
			}

			$$renderer.push(`<!--]--></button></div></div> <div class="bg-border mt-3 mb-4 h-1 w-full overflow-hidden rounded-full" role="progressbar"${$.attr('aria-valuenow', passwordStrength.strengthScore)}${$.attr('aria-valuemin', 0)}${$.attr('aria-valuemax', 4)} aria-label="Password strength"><div${$.attr_class($.clsx(cn(`h-full transition-all duration-500 ease-out`, passwordStrength.strengthColor)))}${$.attr_style('', {
				width: `${$.stringify(passwordStrength.strengthScore / 4 * 100)}%`
			})}></div></div> <p id="password-strength" class="text-foreground mb-2 text-sm font-medium">${$.escape(passwordStrength.strengthText)}. Must contain:</p> <ul class="space-y-1.5" aria-label="Password requirements"><!--[-->`);

			const each_array = $.ensure_array_like(passwordStrength.strength);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let req = each_array[$$index];

				$$renderer.push(`<li class="flex items-center space-x-2">`);

				if (req.met) {
					$$renderer.push('<!--[0-->');
					Check($$renderer, { size: 16, class: 'text-emerald-500', 'aria-hidden': 'true' });
				} else {
					$$renderer.push('<!--[-1-->');

					X($$renderer, {
						size: 16,
						class: 'text-muted-foreground/80',
						'aria-hidden': 'true'
					});
				}

				$$renderer.push(`<!--]--> <span${$.attr_class(`text-xs ${req.met ? 'text-emerald-600' : 'text-muted-foreground'}`)}>${$.escape(req.text)} <span class="sr-only">${$.escape(req.met ? ' - Requirement met' : ' - Requirement not met')}</span></span></li>`);
			}

			$$renderer.push(`<!--]--></ul></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}