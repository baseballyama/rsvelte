import * as $ from 'svelte/internal/server';
import { tv } from 'tailwind-variants';
import { usePasswordStrength } from './password.svelte.js';
import { Meter } from 'bits-ui';
import { cn } from '$lib/utils.js';
import { box } from 'svelte-toolbelt';

export default function Password_strength($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { strength = void 0, class: className } = $$props;

		usePasswordStrength({ strength: box.with(() => strength, (v) => strength = v) });

		const score = $.derived(() => strength?.score ?? 0);

		const color = tv({
			base: '',
			variants: {
				score: {
					0: 'bg-red-500',
					1: 'bg-red-500',
					2: 'bg-yellow-500',
					3: 'bg-yellow-500',
					4: 'bg-green-500'
				}
			}
		});

		if (Meter.Root) {
			$$renderer.push('<!--[-->');

			Meter.Root($$renderer, {
				value: score(),
				class: cn('bg-accent relative h-[6px] w-full gap-1 overflow-hidden rounded-full', className),
				min: 0,
				max: 4,
				children: ($$renderer) => {
					$$renderer.push(`<div${$.attr_class($.clsx(cn('h-full transition-all duration-500', color({ score: score() }))))}${$.attr_style(`width: ${$.stringify(score() / 4 * 100)}%;`)}></div> <div class="absolute top-0 left-0 z-10 flex h-[6px] w-full place-items-center gap-1"><!--[-->`);

					const each_array = $.ensure_array_like(Array.from({ length: 4 }));

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let _ = each_array[i];

						$$renderer.push(`<div class="ring-background h-[6px] w-1/4 rounded-full ring-3"></div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$.bind_props($$props, { strength });
	});
}