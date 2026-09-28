import * as $ from 'svelte/internal/server';
import { Input } from '$lib/components/ui/input';
import { Button } from '$lib/components/ui/button';
import { Eye, EyeOff } from '@lucide/svelte';

export default function PasswordInput($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0, $$slots, $$events, ...restProps } = $$props;
		let showPassword = false;
		const inputType = $.derived(() => showPassword ? 'text' : 'password');
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="relative">`);

			Input($$renderer, $.spread_props([
				restProps,
				{
					type: inputType(),
					files: undefined,
					class: 'pr-10',
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					}
				}
			]));

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				type: 'button',
				variant: 'ghost',
				size: 'sm',
				class: 'absolute top-1/2 right-0 h-full w-10 -translate-y-1/2 rounded-lg',
				onclick: () => showPassword = !showPassword,
				'aria-label': showPassword ? 'Hide password' : 'Show password',
				children: ($$renderer) => {
					if (showPassword) {
						$$renderer.push('<!--[0-->');
						EyeOff($$renderer, { class: 'size-4' });
					} else {
						$$renderer.push('<!--[-1-->');
						Eye($$renderer, { class: 'size-4' });
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { value });
	});
}