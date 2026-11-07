import * as $ from 'svelte/internal/server';

function Content($$renderer, { props, wrapperProps }) {
	$$renderer.push(`<div${$.attributes({ ...wrapperProps })}><div${$.attributes({ ...props })}>Content</div></div>`);
}

import { Tooltip } from "bits-ui";

export default function Tooltip_force_mount_test($$renderer, $$props) {
	let {
		open = false,
		portalProps,
		contentProps,
		withOpenCheck,
		$$slots,
		$$events,
		...restProps
	} = $$props;

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<main data-testid="main">`);

		if (Tooltip.Provider) {
			$$renderer.push('<!--[-->');

			Tooltip.Provider($$renderer, {
				delayDuration: 0,
				children: ($$renderer) => {
					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');

						Tooltip.Root($$renderer, $.spread_props([
							restProps,
							{
								get open() {
									return open;
								},

								set open($$value) {
									open = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									if (Tooltip.Trigger) {
										$$renderer.push('<!--[-->');

										Tooltip.Trigger($$renderer, {
											'data-testid': 'trigger',
											children: ($$renderer) => {
												$$renderer.push(`<!---->@sveltejs`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Portal) {
										$$renderer.push('<!--[-->');

										Tooltip.Portal($$renderer, $.spread_props([
											portalProps,
											{
												children: ($$renderer) => {
													if (withOpenCheck) {
														$$renderer.push('<!--[0-->');

														{
															function child($$renderer, props) {
																if (props.open) {
																	$$renderer.push('<!--[0-->');
																	Content($$renderer, props);
																} else {
																	$$renderer.push('<!--[-1-->');
																}

																$$renderer.push(`<!--]-->`);
															}

															if (Tooltip.Content) {
																$$renderer.push('<!--[-->');

																Tooltip.Content($$renderer, $.spread_props([
																	contentProps,
																	{
																		'data-testid': 'content',
																		class: 'w-80',
																		forceMount: true,
																		child,
																		$$slots: { child: true }
																	}
																]));

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														}
													} else {
														$$renderer.push('<!--[-1-->');

														{
															function child($$renderer, props) {
																Content($$renderer, props);
															}

															if (Tooltip.Content) {
																$$renderer.push('<!--[-->');

																Tooltip.Content($$renderer, $.spread_props([
																	contentProps,
																	{
																		'data-testid': 'content',
																		class: 'w-80',
																		forceMount: true,
																		child,
																		$$slots: { child: true }
																	}
																]));

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														}
													}

													$$renderer.push(`<!--]-->`);
												},
												$$slots: { default: true }
											}
										]));

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							}
						]));

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

		$$renderer.push(` <button data-testid="binding">${$.escape(open)}</button> <div class="h-96"></div> <div data-testid="outside">outside</div></main> <div data-testid="portal-target" id="portal-target"></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}