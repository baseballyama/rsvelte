import * as $ from 'svelte/internal/server';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "bits-ui";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputOTP from "$lib/registry/ui/input-otp/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Input_otp_alphanumeric($$renderer) {
	Example($$renderer, {
		title: 'Alphanumeric',
		children: ($$renderer) => {
			if (Field.Field) {
				$$renderer.push('<!--[-->');

				Field.Field($$renderer, {
					children: ($$renderer) => {
						if (Field.Label) {
							$$renderer.push('<!--[-->');

							Field.Label($$renderer, {
								for: 'alphanumeric',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Alphanumeric`);
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
									$$renderer.push(`<!---->Accepts both letters and numbers.`);
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

											const each_array = $.ensure_array_like(cells.slice(0, 3));

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

								$$renderer.push(` `);

								if (InputOTP.Separator) {
									$$renderer.push('<!--[-->');
									InputOTP.Separator($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (InputOTP.Group) {
									$$renderer.push('<!--[-->');

									InputOTP.Group($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!--[-->`);

											const each_array_1 = $.ensure_array_like(cells.slice(3, 6));

											for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
												let cell = each_array_1[$$index_1];

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
									id: 'alphanumeric',
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