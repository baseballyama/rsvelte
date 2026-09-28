import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "bits-ui";
import * as InputOTP from "$lib/registry/ui/input-otp/index.js";

export default function Input_otp_pattern($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let cells = () => ($$arg0?.()).cells;
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => InputOTP.Group, ($$anchor, InputOTP_Group) => {
				InputOTP_Group($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.each(node_2, 16, cells, (cell) => cell, ($$anchor, cell) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							$.component(node_3, () => InputOTP.Slot, ($$anchor, InputOTP_Slot) => {
								InputOTP_Slot($$anchor, {
									get cell() {
										return cell;
									}
								});
							});

							$.append($$anchor, fragment_3);
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.component(node, () => InputOTP.Root, ($$anchor, InputOTP_Root) => {
			InputOTP_Root($$anchor, {
				maxlength: 6,
				get pattern() {
					return REGEXP_ONLY_DIGITS_AND_CHARS;
				},
				children,
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
}