import * as $ from 'svelte/internal/server';
import { Steps } from '@skeletonlabs/skeleton-svelte';

export default function _page($$renderer) {
	Steps($$renderer, {
		defaultStep: 0,
		count: 3,
		orientation: 'vertical',
		class: 'w-ful h-48',
		children: ($$renderer) => {
			if (Steps.List) {
				$$renderer.push('<!--[-->');

				Steps.List($$renderer, {
					children: ($$renderer) => {
						if (Steps.Item) {
							$$renderer.push('<!--[-->');

							Steps.Item($$renderer, {
								index: 0,
								children: ($$renderer) => {
									if (Steps.Trigger) {
										$$renderer.push('<!--[-->');

										Steps.Trigger($$renderer, {
											children: ($$renderer) => {
												if (Steps.Indicator) {
													$$renderer.push('<!--[-->');

													Steps.Indicator($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->1`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` First`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Steps.Separator) {
										$$renderer.push('<!--[-->');
										Steps.Separator($$renderer, {});
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

						if (Steps.Item) {
							$$renderer.push('<!--[-->');

							Steps.Item($$renderer, {
								index: 1,
								children: ($$renderer) => {
									if (Steps.Trigger) {
										$$renderer.push('<!--[-->');

										Steps.Trigger($$renderer, {
											children: ($$renderer) => {
												if (Steps.Indicator) {
													$$renderer.push('<!--[-->');

													Steps.Indicator($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->2`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` Then`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Steps.Separator) {
										$$renderer.push('<!--[-->');
										Steps.Separator($$renderer, {});
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

						if (Steps.Item) {
							$$renderer.push('<!--[-->');

							Steps.Item($$renderer, {
								index: 2,
								children: ($$renderer) => {
									if (Steps.Trigger) {
										$$renderer.push('<!--[-->');

										Steps.Trigger($$renderer, {
											children: ($$renderer) => {
												if (Steps.Indicator) {
													$$renderer.push('<!--[-->');

													Steps.Indicator($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->3`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` Finally`);
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

			$$renderer.push(` <div class="flex flex-col grow">`);

			if (Steps.Content) {
				$$renderer.push('<!--[-->');

				Steps.Content($$renderer, {
					class: 'grow',
					index: 0,
					children: ($$renderer) => {
						$$renderer.push(`<!---->First do this.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Steps.Content) {
				$$renderer.push('<!--[-->');

				Steps.Content($$renderer, {
					class: 'grow',
					index: 1,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Then do that.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Steps.Content) {
				$$renderer.push('<!--[-->');

				Steps.Content($$renderer, {
					class: 'grow',
					index: 2,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Almost there...`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Steps.Content) {
				$$renderer.push('<!--[-->');

				Steps.Content($$renderer, {
					class: 'grow',
					index: 3,
					children: ($$renderer) => {
						$$renderer.push(`<!---->All done!`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <div class="flex justify-between items-center gap-2">`);

			if (Steps.PrevTrigger) {
				$$renderer.push('<!--[-->');

				Steps.PrevTrigger($$renderer, {
					class: 'btn preset-filled',
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

			if (Steps.NextTrigger) {
				$$renderer.push('<!--[-->');

				Steps.NextTrigger($$renderer, {
					class: 'btn preset-filled',
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
}