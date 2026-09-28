import * as $ from 'svelte/internal/server';
import * as Stepper from '$lib/components/ui/stepper';
import Search from '@lucide/svelte/icons/search';
import Download from '@lucide/svelte/icons/download';
import Code from '@lucide/svelte/icons/code';

export default function Stepper_example($$renderer) {
	let step = 1;

	const steps = [
		{ step: 1, icon: Search },
		{ step: 2, icon: Download },
		{ step: 3, icon: Code }
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="rounded-lg border p-6">`);

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
					if (Stepper.Nav) {
						$$renderer.push('<!--[-->');

						Stepper.Nav($$renderer, {
							orientation: 'horizontal',
							class: 'w-full justify-between px-4',
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(steps);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let item = each_array[$$index];

									if (Stepper.Item) {
										$$renderer.push('<!--[-->');

										Stepper.Item($$renderer, {
											children: ($$renderer) => {
												if (Stepper.Trigger) {
													$$renderer.push('<!--[-->');

													Stepper.Trigger($$renderer, {
														class: 'flex max-w-[150px] flex-col items-center',
														children: ($$renderer) => {
															if (Stepper.Indicator) {
																$$renderer.push('<!--[-->');

																Stepper.Indicator($$renderer, {
																	children: ($$renderer) => {
																		if (item.icon) {
																			$$renderer.push('<!--[-->');
																			item.icon($$renderer, {});
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

															$$renderer.push(` <div class="flex flex-col"></div>`);
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