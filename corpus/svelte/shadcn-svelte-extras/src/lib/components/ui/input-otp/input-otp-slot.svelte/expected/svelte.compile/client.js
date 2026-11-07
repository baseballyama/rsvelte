import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PinInput as InputOTPPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'cell', 'class']);
var root = $.from_html(`<div class="cn-input-otp-caret pointer-events-none absolute inset-0 flex items-center justify-center"><div class="animate-caret-blink bg-foreground bg-foreground h-4 w-px duration-1000"></div></div>`);
var root_1 = $.from_html(` <!>`, 1);

export default function Input_otp_slot($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('dark:bg-input/30 border-input data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive relative flex size-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-3', $$props.class));

		$.component(node, () => InputOTPPrimitive.Cell, ($$anchor, InputOTPPrimitive_Cell) => {
			InputOTPPrimitive_Cell($$anchor, $.spread_props(
				{
					get cell() {
						return $$props.cell;
					},
					'data-slot': 'input-otp-slot',
					get class() {
						return $.get($0);
					}
				},
				() => restProps,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_1 = root_1();
						var text = $.first_child(fragment_1);
						var node_1 = $.sibling(text);

						{
							var consequent = ($$anchor) => {
								var div = root();

								$.append($$anchor, div);
							};

							$.if(node_1, ($$render) => {
								if ($$props.cell.hasFakeCaret) $$render(consequent);
							});
						}

						$.template_effect(() => $.set_text(text, `${$$props.cell.char ?? ''} `));
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}