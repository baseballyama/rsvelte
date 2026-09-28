import * as $ from 'svelte/internal/server';
import { REGEXP_ONLY_DIGITS } from "bits-ui";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputOTP from "$lib/registry/ui/input-otp/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Input_otp_pattern($$renderer) {
	Example($$renderer, {
		title: 'Digits Only',
		children: ($$renderer) => {
			if (Field.Field) {
				$$renderer.push('<!--[-->');

				Field.Field($$renderer, {
					children: ($$renderer) => {
						if (Field.Label) {
							$$renderer.push('<!--[-->');

							Field.Label($$renderer, {
								for: 'digits-only',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Digits Only`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

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
									id: 'digits-only',
									maxlength: 6,
									pattern: REGEXP_ONLY_DIGITS,
									children,
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}