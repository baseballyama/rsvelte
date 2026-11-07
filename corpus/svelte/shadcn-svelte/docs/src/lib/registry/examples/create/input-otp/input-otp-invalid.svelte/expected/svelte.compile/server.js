import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputOTP from "$lib/registry/ui/input-otp/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Input_otp_invalid($$renderer) {
	let value = "000000";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'Invalid State',
			children: ($$renderer) => {
				if (Field.Field) {
					$$renderer.push('<!--[-->');

					Field.Field($$renderer, {
						children: ($$renderer) => {
							if (Field.Label) {
								$$renderer.push('<!--[-->');

								Field.Label($$renderer, {
									for: 'invalid',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Invalid State`);
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
										$$renderer.push(`<!---->Example showing the invalid error state.`);
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

												const each_array = $.ensure_array_like(cells.slice(0, 2));

												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let cell = each_array[$$index];

													if (InputOTP.Slot) {
														$$renderer.push('<!--[-->');
														InputOTP.Slot($$renderer, { cell, 'aria-invalid': true });
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

												const each_array_1 = $.ensure_array_like(cells.slice(2, 4));

												for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
													let cell = each_array_1[$$index_1];

													if (InputOTP.Slot) {
														$$renderer.push('<!--[-->');
														InputOTP.Slot($$renderer, { cell, 'aria-invalid': true });
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

												const each_array_2 = $.ensure_array_like(cells.slice(4, 6));

												for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
													let cell = each_array_2[$$index_2];

													if (InputOTP.Slot) {
														$$renderer.push('<!--[-->');
														InputOTP.Slot($$renderer, { cell, 'aria-invalid': true });
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
										id: 'invalid',
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

							$$renderer.push(` `);

							if (Field.Error) {
								$$renderer.push('<!--[-->');
								Field.Error($$renderer, { errors: [{ message: "Invalid code. Please try again." }] });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
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

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}