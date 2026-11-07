import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputOTP from "$lib/registry/ui/input-otp/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Input_otp_simple($$renderer) {
	Example($$renderer, {
		title: 'Simple',
		children: ($$renderer) => {
			if (Field.Field) {
				$$renderer.push('<!--[-->');

				Field.Field($$renderer, {
					children: ($$renderer) => {
						if (Field.Label) {
							$$renderer.push('<!--[-->');

							Field.Label($$renderer, {
								for: 'simple',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Simple`);
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
									id: 'simple',
									maxlength: 6,
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