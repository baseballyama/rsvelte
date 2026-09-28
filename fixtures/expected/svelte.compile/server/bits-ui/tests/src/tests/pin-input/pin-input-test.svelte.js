import * as $ from 'svelte/internal/server';
import { PinInput } from "bits-ui";

function Cell($$renderer, props, idx) {
	$$renderer.push(`<div${$.attr('data-testid', `cell-${$.stringify(idx)}`)}${$.attr('data-active', props.isActive ? "" : undefined)}>`);

	if (props.char !== null) {
		$$renderer.push(`<!--[0-->${$.escape(props.char)}`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (props.hasFakeCaret) {
		$$renderer.push(`<!--[0--><div class="animate-caret-blink pointer-events-none absolute inset-0 flex items-center justify-center"${$.attr('data-testid', `caret-${$.stringify(idx)}`)}><div class="h-8 w-px bg-white"></div></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div>`);
}

export default function Pin_input_test($$renderer, $$props) {
	let {
		onComplete = () => {},
		maxlength = 6,
		value = "",
		toCopy,
		$$slots,
		$$events,
		...restProps
	} = $$props;

	let inputRef = null;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<main><button aria-label="binding" data-testid="binding">${$.escape(value)}</button> <button type="button" data-testid="focus-input">focus input</button> `);

		{
			function children(
				$$renderer,
				{ cells, isFocused: _isFocused, isHovering: _isHovering }
			) {
				$$renderer.push(`<div class="flex"><!--[-->`);

				const each_array = $.ensure_array_like(cells.slice(0, 3));

				for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
					let cell = each_array[idx];

					Cell($$renderer, cell, idx);
				}

				$$renderer.push(`<!--]--></div> <div class="flex w-10 items-center justify-center"><div class="bg-border h-1 w-3 rounded-full"></div></div> <div class="flex"><!--[-->`);

				const each_array_1 = $.ensure_array_like(cells.slice(3, 6));

				for (let idx = 0, $$length = each_array_1.length; idx < $$length; idx++) {
					let cell = each_array_1[idx];

					Cell($$renderer, cell, idx + 3);
				}

				$$renderer.push(`<!--]--></div>`);
			}

			if (PinInput.Root) {
				$$renderer.push('<!--[-->');

				PinInput.Root($$renderer, $.spread_props([
					{
						'aria-label': 'my input',
						inputId: 'myInput',
						class: 'group/pininput text-foreground flex items-center has-[:disabled]:opacity-30',
						maxlength,
						onComplete,
						'data-testid': 'input'
					},
					restProps,
					{
						get inputRef() {
							return inputRef;
						},

						set inputRef($$value) {
							inputRef = $$value;
							$$settled = false;
						},

						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},
						children,
						$$slots: { default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(` <div data-testid="to-copy">${$.escape(toCopy)}</div></main>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}