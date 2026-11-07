import * as $ from 'svelte/internal/server';
import { PinInput, REGEXP_ONLY_DIGITS } from "bits-ui";
import { toast } from "svelte-sonner";
import { cn } from "$lib/utils/styles.js";

function Cell($$renderer, cell) {
	if (PinInput.Cell) {
		$$renderer.push('<!--[-->');

		PinInput.Cell($$renderer, {
			cell,
			class: cn("focus-override", "relative h-14 w-10 text-[2rem]", "flex items-center justify-center", "transition-all duration-75", "border-foreground/20 border-y border-r first:rounded-l-md first:border-l last:rounded-r-md", "text-foreground group-focus-within/pininput:border-foreground/40 group-hover/pininput:border-foreground/40", "outline-0", "data-active:outline-1 data-active:outline-white"),
			children: ($$renderer) => {
				if (cell.char !== null) {
					$$renderer.push(`<!--[0--><div>${$.escape(cell.char)}</div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (cell.hasFakeCaret) {
					$$renderer.push(`<!--[0--><div class="animate-caret-blink pointer-events-none absolute inset-0 flex items-center justify-center"><div class="h-8 w-px bg-white"></div></div>`);
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

export default function Pin_input_demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = "";

		function onComplete() {
			toast.success(`Completed with value ${value}`);
			value = "";
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function children($$renderer, { cells }) {
					$$renderer.push(`<div class="flex"><!--[-->`);

					const each_array = $.ensure_array_like(cells.slice(0, 3));

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let cell = each_array[i];

						Cell($$renderer, cell);
					}

					$$renderer.push(`<!--]--></div> <div class="flex w-10 items-center justify-center"><div class="bg-border h-1 w-3 rounded-full"></div></div> <div class="flex"><!--[-->`);

					const each_array_1 = $.ensure_array_like(cells.slice(3, 6));

					for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
						let cell = each_array_1[i];

						Cell($$renderer, cell);
					}

					$$renderer.push(`<!--]--></div>`);
				}

				if (PinInput.Root) {
					$$renderer.push('<!--[-->');

					PinInput.Root($$renderer, {
						class: 'group/pininput text-foreground has-disabled:opacity-30 flex items-center',
						maxlength: 6,
						onComplete,
						pattern: REGEXP_ONLY_DIGITS,
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}