import * as $ from 'svelte/internal/server';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "bits-ui";
import * as InputOTP from "$lib/registry/ui/input-otp/index.js";

export default function Input_otp_pattern($$renderer) {
	{
		function children($$renderer, { cells }) {
			if (InputOTP.Group) {
				$$renderer.push('<!--[-->');

				InputOTP.Group($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(cells);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let cell = each_array[$$index];

							if (InputOTP.Slot) {
								$$renderer.push('<!--[-->');
								InputOTP.Slot($$renderer, { cell });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
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

		if (InputOTP.Root) {
			$$renderer.push('<!--[-->');

			InputOTP.Root($$renderer, {
				maxlength: 6,
				pattern: REGEXP_ONLY_DIGITS_AND_CHARS,
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