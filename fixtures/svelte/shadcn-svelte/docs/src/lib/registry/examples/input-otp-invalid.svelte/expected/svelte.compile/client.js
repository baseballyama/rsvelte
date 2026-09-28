import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as InputOTP from "$lib/registry/ui/input-otp/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Input_otp_invalid($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let cells = () => ($$arg0?.()).cells;
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => InputOTP.Group, ($$anchor, InputOTP_Group) => {
				InputOTP_Group($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.each(node_2, 16, () => cells().slice(0, 3), (cell) => cell, ($$anchor, cell) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							$.component(node_3, () => InputOTP.Slot, ($$anchor, InputOTP_Slot) => {
								InputOTP_Slot($$anchor, {
									'aria-invalid': true,
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

			var node_4 = $.sibling(node_1, 2);

			$.component(node_4, () => InputOTP.Separator, ($$anchor, InputOTP_Separator) => {
				InputOTP_Separator($$anchor, {});
			});

			var node_5 = $.sibling(node_4, 2);

			$.component(node_5, () => InputOTP.Group, ($$anchor, InputOTP_Group_1) => {
				InputOTP_Group_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = $.comment();
						var node_6 = $.first_child(fragment_4);

						$.each(node_6, 16, () => cells().slice(3, 6), (cell) => cell, ($$anchor, cell) => {
							var fragment_5 = $.comment();
							var node_7 = $.first_child(fragment_5);

							$.component(node_7, () => InputOTP.Slot, ($$anchor, InputOTP_Slot_1) => {
								InputOTP_Slot_1($$anchor, {
									'aria-invalid': true,
									get cell() {
										return cell;
									}
								});
							});

							$.append($$anchor, fragment_5);
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.component(node, () => InputOTP.Root, ($$anchor, InputOTP_Root) => {
			InputOTP_Root($$anchor, { maxlength: 6, children, $$slots: { default: true } });
		});
	}

	$.append($$anchor, fragment);
}