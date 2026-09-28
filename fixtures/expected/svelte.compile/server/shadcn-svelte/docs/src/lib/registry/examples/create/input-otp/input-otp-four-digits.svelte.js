import * as $ from 'svelte/internal/server';
import { REGEXP_ONLY_DIGITS } from "bits-ui";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputOTP from "$lib/registry/ui/input-otp/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Input_otp_four_digits($$renderer) {
	Example($$renderer, {
		title: '4 Digits',
		children: ($$renderer) => {
			if (Field.Field) {
				$$renderer.push('<!--[-->');

				Field.Field($$renderer, {
					children: ($$renderer) => {
						if (Field.Label) {
							$$renderer.push('<!--[-->');

							Field.Label($$renderer, {
								for: 'four-digits',
								children: ($$renderer) => {
									$$renderer.push(`<!---->4 Digits`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Field.Description) {
							$$renderer.push('<!--[-->');

							Field.Description($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Common pattern for PIN codes.`);
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
									id: 'four-digits',
									maxlength: 4,
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