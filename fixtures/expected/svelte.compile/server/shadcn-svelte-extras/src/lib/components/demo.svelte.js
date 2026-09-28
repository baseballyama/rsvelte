import * as $ from 'svelte/internal/server';
import * as Demo from '$lib/components/ui/demo';
import { cn } from '$lib/utils';
import { Spinner } from './ui/spinner';

export default function Demo_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { demo, class: className } = $$props;
		const ComponentPromise = $.derived(() => import(`$lib/demos/${demo}.svelte`).then(({ default: Component }) => Component));

		if (Demo.Root) {
			$$renderer.push('<!--[-->');

			Demo.Root($$renderer, {
				class: 'mt-6',
				children: ($$renderer) => {
					if (Demo.ActionsGroup) {
						$$renderer.push('<!--[-->');

						Demo.ActionsGroup($$renderer, {
							class: 'justify-between',
							children: ($$renderer) => {
								if (Demo.Tabs) {
									$$renderer.push('<!--[-->');
									Demo.Tabs($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Demo.ActionsGroup) {
									$$renderer.push('<!--[-->');

									Demo.ActionsGroup($$renderer, {
										children: ($$renderer) => {
											if (Demo.ControlGroup) {
												$$renderer.push('<!--[-->');

												Demo.ControlGroup($$renderer, {
													children: ($$renderer) => {
														if (Demo.Fullscreen) {
															$$renderer.push('<!--[-->');
															Demo.Fullscreen($$renderer, {});
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Demo.ControlGroupSeparator) {
															$$renderer.push('<!--[-->');
															Demo.ControlGroupSeparator($$renderer, {});
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Demo.ControlRefresh) {
															$$renderer.push('<!--[-->');
															Demo.ControlRefresh($$renderer, {});
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

					$$renderer.push(` `);

					if (Demo.Preview) {
						$$renderer.push('<!--[-->');

						Demo.Preview($$renderer, {
							type: 'component',
							demo,
							children: ($$renderer) => {
								$$renderer.push(`<div data-toc-ignore=""${$.attr_class($.clsx(cn('flex h-full w-full max-w-full items-center justify-center p-4', className)))}>`);

								$.await(
									$$renderer,
									ComponentPromise(),
									() => {
										Spinner($$renderer, {});
									},
									(Component) => {
										if (Component) {
											$$renderer.push('<!--[-->');
											Component($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}
								);

								$$renderer.push(`<!--]--></div>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Demo.Code) {
						$$renderer.push('<!--[-->');

						Demo.Code($$renderer, {
							code: import(`$lib/demos/${demo}.svelte?raw`).then(({ default: Code }) => Code)
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
	});
}