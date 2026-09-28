import * as $ from 'svelte/internal/server';
import { Popover } from "bits-ui";

export default function Popover_test($$renderer, $$props) {
	let {
		open = false,
		contentProps,
		portalProps,
		overlayProps,
		withOverlay = false,
		$$slots,
		$$events,
		...restProps
	} = $$props;

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<main data-testid="main">`);

		if (Popover.Root) {
			$$renderer.push('<!--[-->');

			Popover.Root($$renderer, $.spread_props([
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
						if (Popover.Trigger) {
							$$renderer.push('<!--[-->');

							Popover.Trigger($$renderer, {
								'data-testid': 'trigger',
								children: ($$renderer) => {
									$$renderer.push(`<!---->trigger`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Popover.Portal) {
							$$renderer.push('<!--[-->');

							Popover.Portal($$renderer, $.spread_props([
								portalProps,
								{
									children: ($$renderer) => {
										if (withOverlay) {
											$$renderer.push('<!--[0-->');

											if (Popover.Overlay) {
												$$renderer.push('<!--[-->');
												Popover.Overlay($$renderer, $.spread_props([overlayProps, { 'data-testid': 'overlay' }]));
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										if (Popover.Content) {
											$$renderer.push('<!--[-->');

											Popover.Content($$renderer, $.spread_props([
												contentProps,
												{
													'data-testid': 'content',
													children: ($$renderer) => {
														$$renderer.push(`<!---->content `);

														if (Popover.Close) {
															$$renderer.push('<!--[-->');

															Popover.Close($$renderer, {
																'data-testid': 'close',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->close`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Popover.Arrow) {
															$$renderer.push('<!--[-->');
															Popover.Arrow($$renderer, { 'data-testid': 'arrow' });
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

		$$renderer.push(` <button data-testid="binding">${$.escape(open)}</button> <div data-testid="outside">outside</div></main> <div data-testid="portal-target" id="portal-target"></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}