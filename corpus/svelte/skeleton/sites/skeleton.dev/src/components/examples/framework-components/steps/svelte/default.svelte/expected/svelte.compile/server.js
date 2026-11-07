import * as $ from 'svelte/internal/server';
import { Steps } from '@skeletonlabs/skeleton-svelte';

export default function Default($$renderer) {
	const steps = [
		{ title: 'First', content: 'First do this.' },
		{ title: 'Then', content: 'Then do that.' },
		{ title: 'Finally', content: 'Almost done...' }
	];

	Steps($$renderer, {
		count: steps.length,
		class: 'w-full',
		children: ($$renderer) => {
			if (Steps.List) {
				$$renderer.push('<!--[-->');

				Steps.List($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(steps);

						for (let index = 0, $$length = each_array.length; index < $$length; index++) {
							let item = each_array[index];

							if (Steps.Item) {
								$$renderer.push('<!--[-->');

								Steps.Item($$renderer, {
									index,
									children: ($$renderer) => {
										if (Steps.Trigger) {
											$$renderer.push('<!--[-->');

											Steps.Trigger($$renderer, {
												children: ($$renderer) => {
													if (Steps.Indicator) {
														$$renderer.push('<!--[-->');

														Steps.Indicator($$renderer, {
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

													$$renderer.push(` ${$.escape(item.title)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (index < steps.length - 1) {
											$$renderer.push('<!--[0-->');

											if (Steps.Separator) {
												$$renderer.push('<!--[-->');
												Steps.Separator($$renderer, {});
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										} else {
											$$renderer.push('<!--[-1-->');
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

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <!--[-->`);

			const each_array_1 = $.ensure_array_like(steps);

			for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
				let item = each_array_1[index];

				if (Steps.Content) {
					$$renderer.push('<!--[-->');

					Steps.Content($$renderer, {
						index,
						class: 'card preset-filled-surface-100-900 p-4 flex justify-center items-center',
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(item.content)}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`<!--]--> `);

			if (Steps.Content) {
				$$renderer.push('<!--[-->');

				Steps.Content($$renderer, {
					index: steps.length,
					class: 'card preset-filled-surface-100-900 p-4 flex justify-center items-center',
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
						$$renderer.push(`<!---->Back`);
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

			$$renderer.push(`</div>`);
		},
		$$slots: { default: true }
	});
}