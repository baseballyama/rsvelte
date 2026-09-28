import * as $ from 'svelte/internal/server';
import { Tooltip } from "bits-ui";

export default function Tooltip_singleton_force_mount_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { withOpenCheck = false, $$slots, $$events, ...rootProps } = $$props;
		const tether = Tooltip.createTether();
		let open = false;
		let triggerId = null;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<main data-testid="main">`);

			if (Tooltip.Provider) {
				$$renderer.push('<!--[-->');

				Tooltip.Provider($$renderer, {
					delayDuration: 0,
					children: ($$renderer) => {
						{
							function children($$renderer, { payload }) {
								if (Tooltip.Trigger) {
									$$renderer.push('<!--[-->');

									Tooltip.Trigger($$renderer, {
										id: 'trigger-1',
										'data-testid': 'trigger-1',
										tether,
										payload: { label: "Alpha" },
										children: ($$renderer) => {
											$$renderer.push(`<!---->Alpha`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Tooltip.Trigger) {
									$$renderer.push('<!--[-->');

									Tooltip.Trigger($$renderer, {
										id: 'trigger-2',
										'data-testid': 'trigger-2',
										tether,
										payload: { label: "Beta" },
										children: ($$renderer) => {
											$$renderer.push(`<!---->Beta`);
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

									Tooltip.Portal($$renderer, {
										children: ($$renderer) => {
											{
												function child($$renderer, { wrapperProps, props, open: contentOpen }) {
													if (withOpenCheck) {
														$$renderer.push('<!--[0-->');

														if (contentOpen) {
															$$renderer.push(`<!--[0--><div${$.attributes({ ...wrapperProps })}><div${$.attributes({ ...props, 'data-testid': 'content-node' })}><span data-testid="payload">${$.escape(payload?.label ?? "null")}</span></div></div>`);
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]-->`);
													} else {
														$$renderer.push(`<!--[-1--><div${$.attributes({ ...wrapperProps })}><div${$.attributes({ ...props, 'data-testid': 'content-node' })}><span data-testid="payload">${$.escape(payload?.label ?? "null")}</span></div></div>`);
													}

													$$renderer.push(`<!--]-->`);
												}

												if (Tooltip.Content) {
													$$renderer.push('<!--[-->');

													Tooltip.Content($$renderer, {
														'data-testid': 'content',
														forceMount: true,
														child,
														$$slots: { child: true }
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
							}

							if (Tooltip.Root) {
								$$renderer.push('<!--[-->');

								Tooltip.Root($$renderer, $.spread_props([
									{ tether },
									rootProps,
									{
										get open() {
											return open;
										},

										set open($$value) {
											open = $$value;
											$$settled = false;
										},

										get triggerId() {
											return triggerId;
										},

										set triggerId($$value) {
											triggerId = $$value;
											$$settled = false;
										},
										children,
										$$slots: { default: true }
									}
								]));

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

			$$renderer.push(` <div data-testid="open-binding">${$.escape(open ? "true" : "false")}</div> <div data-testid="trigger-binding">${$.escape(triggerId ?? "null")}</div> <div data-testid="outside">outside</div></main>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}