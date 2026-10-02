import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";

export default function Field_radio_demo($$renderer) {
	let plan = "monthly";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="w-full max-w-md">`);

		if (Field.Set) {
			$$renderer.push('<!--[-->');

			Field.Set($$renderer, {
				children: ($$renderer) => {
					if (Field.Label) {
						$$renderer.push('<!--[-->');

						Field.Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Subscription Plan`);
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
								$$renderer.push(`<!---->Yearly and lifetime plans offer significant savings.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (RadioGroup.Root) {
						$$renderer.push('<!--[-->');

						RadioGroup.Root($$renderer, {
							get value() {
								return plan;
							},

							set value($$value) {
								plan = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Field.Field) {
									$$renderer.push('<!--[-->');

									Field.Field($$renderer, {
										orientation: 'horizontal',
										children: ($$renderer) => {
											if (RadioGroup.Item) {
												$$renderer.push('<!--[-->');
												RadioGroup.Item($$renderer, { value: 'monthly', id: 'plan-monthly' });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Field.Label) {
												$$renderer.push('<!--[-->');

												Field.Label($$renderer, {
													for: 'plan-monthly',
													class: 'font-normal',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Monthly ($9.99/month)`);
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

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Field.Field) {
									$$renderer.push('<!--[-->');

									Field.Field($$renderer, {
										orientation: 'horizontal',
										children: ($$renderer) => {
											if (RadioGroup.Item) {
												$$renderer.push('<!--[-->');
												RadioGroup.Item($$renderer, { value: 'yearly', id: 'plan-yearly' });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Field.Label) {
												$$renderer.push('<!--[-->');

												Field.Label($$renderer, {
													for: 'plan-yearly',
													class: 'font-normal',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Yearly ($99.99/year)`);
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

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Field.Field) {
									$$renderer.push('<!--[-->');

									Field.Field($$renderer, {
										orientation: 'horizontal',
										children: ($$renderer) => {
											if (RadioGroup.Item) {
												$$renderer.push('<!--[-->');
												RadioGroup.Item($$renderer, { value: 'lifetime', id: 'plan-lifetime' });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Field.Label) {
												$$renderer.push('<!--[-->');

												Field.Label($$renderer, {
													for: 'plan-lifetime',
													class: 'font-normal',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Lifetime ($299.99)`);
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

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}