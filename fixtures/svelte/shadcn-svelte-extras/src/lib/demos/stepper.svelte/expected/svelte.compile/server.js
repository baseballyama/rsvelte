import * as $ from 'svelte/internal/server';
import * as Stepper from '$lib/components/ui/stepper';

export default function Stepper_1($$renderer) {
	let step = 2;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (Stepper.Root) {
			$$renderer.push('<!--[-->');

			Stepper.Root($$renderer, {
				get step() {
					return step;
				},

				set step($$value) {
					step = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<div class="flex w-10/12 flex-col gap-8 px-4">`);

					if (Stepper.Nav) {
						$$renderer.push('<!--[-->');

						Stepper.Nav($$renderer, {
							orientation: 'horizontal',
							class: 'justify-between',
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(Array.from({ length: 4 }));

								for (let index = 0, $$length = each_array.length; index < $$length; index++) {
									let _ = each_array[index];

									if (Stepper.Item) {
										$$renderer.push('<!--[-->');

										Stepper.Item($$renderer, {
											children: ($$renderer) => {
												if (Stepper.Trigger) {
													$$renderer.push('<!--[-->');

													Stepper.Trigger($$renderer, {
														children: ($$renderer) => {
															if (Stepper.Indicator) {
																$$renderer.push('<!--[-->');

																Stepper.Indicator($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(index + 1)}`);
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

												if (Stepper.Separator) {
													$$renderer.push('<!--[-->');
													Stepper.Separator($$renderer, {});
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

					$$renderer.push(` <div class="flex w-full justify-between">`);

					if (Stepper.Previous) {
						$$renderer.push('<!--[-->');

						Stepper.Previous($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Previous`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Stepper.Next) {
						$$renderer.push('<!--[-->');

						Stepper.Next($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Next`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}