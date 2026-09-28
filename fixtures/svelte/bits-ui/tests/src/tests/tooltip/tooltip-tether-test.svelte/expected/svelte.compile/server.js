import * as $ from 'svelte/internal/server';
import { Tooltip } from "bits-ui";

export default function Tooltip_tether_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
						$$renderer.push(`<div data-testid="detached-top">`);

						if (Tooltip.Trigger) {
							$$renderer.push('<!--[-->');

							Tooltip.Trigger($$renderer, {
								id: 'trigger-top',
								'data-testid': 'trigger-top',
								tether,
								payload: { label: "Top" },
								children: ($$renderer) => {
									$$renderer.push(`<!---->Top`);
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

									get triggerId() {
										return triggerId;
									},

									set triggerId($$value) {
										triggerId = $$value;
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

						$$renderer.push(` <div data-testid="detached-bottom">`);

						if (Tooltip.Trigger) {
							$$renderer.push('<!--[-->');

							Tooltip.Trigger($$renderer, {
								id: 'trigger-bottom',
								'data-testid': 'trigger-bottom',
								tether,
								payload: { label: "Bottom" },
								children: ($$renderer) => {
									$$renderer.push(`<!---->Bottom`);
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
								id: 'trigger-disabled',
								'data-testid': 'trigger-disabled',
								tether,
								disabled: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Disabled`);
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

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <button data-testid="tether-open-top">Open top</button> <button data-testid="tether-open-bottom">Open bottom</button> <button data-testid="tether-close">Close tether</button> <div data-testid="open-binding">${$.escape(open ? "true" : "false")}</div> <div data-testid="trigger-binding">${$.escape(triggerId ?? "null")}</div> <div data-testid="outside">outside</div></main>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}