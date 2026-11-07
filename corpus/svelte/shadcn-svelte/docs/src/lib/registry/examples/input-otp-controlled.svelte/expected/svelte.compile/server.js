import * as $ from 'svelte/internal/server';
import * as InputOTP from "$lib/registry/ui/input-otp/index.js";

export default function Input_otp_controlled($$renderer) {
	let value = "";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="space-y-2">`);

		{
			function children($$renderer, { cells }) {
				if (InputOTP.Group) {
					$$renderer.push('<!--[-->');

					InputOTP.Group($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(cells.slice(0, 6));

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

		$$renderer.push(` <div class="text-center text-sm">${$.escape(value === ""
			? "Enter your one-time password."
			: `You entered: ${value}`)}</div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}