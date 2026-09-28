import * as $ from 'svelte/internal/server';
import { Tooltip } from "bits-ui";

export default function Tooltip_tether_gap_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const tether = Tooltip.createTether();
		let open = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<main data-testid="main" style="position: relative; width: 360px; height: 240px; padding: 24px;">`);

			if (Tooltip.Provider) {
				$$renderer.push('<!--[-->');

				Tooltip.Provider($$renderer, {
					delayDuration: 0,
					children: ($$renderer) => {
						$$renderer.push(`<div data-testid="automation-card" style="display: flex; align-items: center; gap: 16px;">`);

						if (Tooltip.Trigger) {
							$$renderer.push('<!--[-->');

							Tooltip.Trigger($$renderer, {
								id: 'trigger-left',
								'data-testid': 'trigger-left',
								tether,
								payload: { label: "Left" },
								children: ($$renderer) => {
									$$renderer.push(`<!---->Left`);
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
								id: 'trigger-right',
								'data-testid': 'trigger-right',
								tether,
								payload: { label: "Right" },
								children: ($$renderer) => {
									$$renderer.push(`<!---->Right`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`</div> `);

						{
							function children($$renderer, { payload }) {
								if (Tooltip.Portal) {
									$$renderer.push('<!--[-->');

									Tooltip.Portal($$renderer, {
										children: ($$renderer) => {
											if (Tooltip.Content) {
												$$renderer.push('<!--[-->');

												Tooltip.Content($$renderer, {
													'data-testid': 'content',
													side: 'top',
													sideOffset: 10,
													children: ($$renderer) => {
														$$renderer.push(`<span data-testid="payload">${$.escape(payload?.label ?? "null")}</span>`);
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
							}

							if (Tooltip.Root) {
								$$renderer.push('<!--[-->');

								Tooltip.Root($$renderer, {
									tether,
									get open() {
										return open;
									},

									set open($$value) {
										open = $$value;
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <div data-testid="open-binding">${$.escape(open ? "true" : "false")}</div> <div data-testid="outside" style="margin-top: 120px;">outside</div></main>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}