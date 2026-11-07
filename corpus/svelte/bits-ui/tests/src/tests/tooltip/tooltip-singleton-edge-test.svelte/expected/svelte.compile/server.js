import * as $ from 'svelte/internal/server';
import { Tooltip } from "bits-ui";

export default function Tooltip_singleton_edge_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const tether = Tooltip.createTether();
		let open = false;
		let triggerId = null;
		let showTriggerOne = true;
		let disableTriggerTwo = false;
		let useCustomAnchor = false;
		let customAnchor = null;
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
								$$renderer.push(`<div data-testid="trigger-group">`);

								if (showTriggerOne) {
									$$renderer.push('<!--[0-->');

									if (Tooltip.Trigger) {
										$$renderer.push('<!--[-->');

										Tooltip.Trigger($$renderer, {
											id: 'trigger-1',
											'data-testid': 'trigger-1',
											tether,
											payload: { label: "First" },
											children: ($$renderer) => {
												$$renderer.push(`<!---->First`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (Tooltip.Trigger) {
									$$renderer.push('<!--[-->');

									Tooltip.Trigger($$renderer, {
										id: 'trigger-2',
										'data-testid': 'trigger-2',
										tether,
										disabled: disableTriggerTwo,
										payload: { label: "Second" },
										children: ($$renderer) => {
											$$renderer.push(`<!---->Second`);
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
										payload: { label: "Disabled" },
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

								$$renderer.push(`</div> `);

								if (Tooltip.Portal) {
									$$renderer.push('<!--[-->');

									Tooltip.Portal($$renderer, {
										children: ($$renderer) => {
											if (Tooltip.Content) {
												$$renderer.push('<!--[-->');

												Tooltip.Content($$renderer, {
													'data-testid': 'content',
													customAnchor: useCustomAnchor ? customAnchor : undefined,
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <button data-testid="toggle-trigger-one">Toggle trigger 1</button> <button data-testid="toggle-trigger-two-disabled">Toggle trigger 2 disabled</button> <button data-testid="toggle-custom-anchor">Toggle custom anchor</button> <div data-testid="open-binding">${$.escape(open ? "true" : "false")}</div> <div data-testid="trigger-binding">${$.escape(triggerId ?? "null")}</div> <div data-testid="custom-anchor" style="margin-top: 20px; margin-left: 220px; width: 20px; height: 20px;">anchor</div> <div data-testid="outside">outside</div></main>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}