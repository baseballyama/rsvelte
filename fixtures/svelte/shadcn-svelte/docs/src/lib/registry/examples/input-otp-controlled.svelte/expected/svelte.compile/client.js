import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as InputOTP from "$lib/registry/ui/input-otp/index.js";

var root = $.from_html(`<div class="space-y-2"><!> <div class="text-center text-sm"> </div></div>`);

export default function Input_otp_controlled($$anchor) {
	let value = $.state("");
	var div = root();
	var node = $.child(div);

	{
		const children = ($$anchor, $$arg0) => {
			let cells = () => ($$arg0?.()).cells;
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => InputOTP.Group, ($$anchor, InputOTP_Group) => {
				InputOTP_Group($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.each(node_2, 16, () => cells().slice(0, 6), (cell) => cell, ($$anchor, cell) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => InputOTP.Slot, ($$anchor, InputOTP_Slot) => {
								InputOTP_Slot($$anchor, {
									get cell() {
										return cell;
									}
								});
							});

							$.append($$anchor, fragment_2);
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		};

		$.component(node, () => InputOTP.Root, ($$anchor, InputOTP_Root) => {
			InputOTP_Root($$anchor, {
				maxlength: 6,
				get value() {
					return $.get(value);
				},

				set value($$value) {
					$.set(value, $$value, true);
				},
				children,
				$$slots: { default: true }
			});
		});
	}

	var div_1 = $.sibling(node, 2);
	var text = $.only_child(div_1, true);

	$.reset(div);

	$.template_effect(() => $.set_text(text, $.get(value) === ""
		? "Enter your one-time password."
		: `You entered: ${$.get(value)}`));

	$.append($$anchor, div);
}