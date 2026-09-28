import * as $ from 'svelte/internal/server';
import { Tooltip } from "bits-ui";

export default function Tooltip_singleton_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { delayDuration = 0, skipDelayDuration = 300 } = $$props;
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
					delayDuration,
					skipDelayDuration,
					children: ($$renderer) => {
						{
							function children($$renderer, { payload }) {
								$$renderer.push(`<div data-testid="trigger-group">`);

								if (Tooltip.Trigger) {
									$$renderer.push('<!--[-->');

									Tooltip.Trigger($$renderer, {
										id: 'trigger-1',
										'data-testid': 'trigger-1',
										tether,
										payload: { label: "Bold" },
										children: ($$renderer) => {
											$$renderer.push(`<!---->Bold`);
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
										payload: { label: "Italic" },
										children: ($$renderer) => {
											$$renderer.push(`<!---->Italic`);
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