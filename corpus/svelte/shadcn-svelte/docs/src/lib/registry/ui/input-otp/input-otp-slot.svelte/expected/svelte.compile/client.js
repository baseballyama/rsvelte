import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PinInput as InputOTPPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'cell', 'class']);
var root = $.from_html(`<div class="cn-input-otp-caret pointer-events-none absolute inset-0 flex items-center justify-center"><div class="cn-input-otp-caret-line h-4 w-px bg-foreground"></div></div>`);
var root_1 = $.from_html(` <!>`, 1);

export default function Input_otp_slot($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("cn-input-otp-slot relative flex items-center justify-center data-[active=true]:z-10", $$props.class));

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