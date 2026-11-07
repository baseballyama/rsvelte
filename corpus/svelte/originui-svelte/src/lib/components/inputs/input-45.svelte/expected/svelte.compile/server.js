import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import { cn } from '$lib/utils.js';
import Minus from '@lucide/svelte/icons/minus';
import { PinInput } from 'bits-ui';

function Cell($$renderer, cell) {
	if (PinInput.Cell) {
		$$renderer.push('<!--[-->');

		PinInput.Cell($$renderer, {
			cell,
			class: cn('border-input bg-background text-foreground ring-offset-background relative flex size-9 items-center justify-center border-y border-e font-medium shadow-xs shadow-black/[.04] transition-all first:rounded-s-lg first:border-s last:rounded-e-lg', {
				'border-ring ring-ring/30 z-10 border ring-2 ring-offset-2': cell.isActive
			}),

			children: ($$renderer) => {
				if (cell.char !== null) {
					$$renderer.push(`<!--[0--><div>${$.escape(cell.char)}</div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}

export default function Input_45($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);
		let value = '';
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="*:not-first:mt-2">`);

			Label($$renderer, {
				for: uid,
				children: ($$renderer) => {
					$$renderer.push(`<!---->OTP input double`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			{
				function children($$renderer, { cells }) {
					$$renderer.push(`<div class="flex"><!--[-->`);

					const each_array = $.ensure_array_like(cells.slice(0, 3));

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let cell = each_array[$$index];

						Cell($$renderer, cell);
					}

					$$renderer.push(`<!--]--></div> <div class="text-muted-foreground/80">`);
					Minus($$renderer, { size: 16, 'aria-hidden': 'true' });
					$$renderer.push(`<!----></div> <div class="flex"><!--[-->`);

					const each_array_1 = $.ensure_array_like(cells.slice(3));

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let cell = each_array_1[$$index_1];

						Cell($$renderer, cell);
					}

					$$renderer.push(`<!--]--></div>`);
				}

				if (PinInput.Root) {
					$$renderer.push('<!--[-->');

					PinInput.Root($$renderer, {
						id: uid,
						class: 'flex items-center gap-3 has-disabled:opacity-50',
						maxlength: 6,
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},
						children,
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(` <p class="text-muted-foreground mt-2 text-xs" role="region" aria-live="polite">Built with <a class="hover:text-foreground underline" href="https://next.bits-ui.com/docs/components/pin-input" target="_blank" rel="noopener nofollow">Bits UI PIN Input</a></p></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}