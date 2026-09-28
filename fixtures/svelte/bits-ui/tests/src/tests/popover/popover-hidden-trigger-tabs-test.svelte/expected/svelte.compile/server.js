import * as $ from 'svelte/internal/server';
import { Popover } from "bits-ui";

export default function Popover_hidden_trigger_tabs_test($$renderer) {
	let activeTab = "popover";
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<main data-testid="main" style="display: flex; flex-direction: column; gap: 24px; padding-top: 72px; padding-left: 72px;"><div role="tablist" aria-label="popover hidden trigger test tabs"><button role="tab" data-testid="tab-popover"${$.attr('aria-selected', activeTab === "popover")} aria-controls="popover-panel">Popover Tab</button> <button role="tab" data-testid="tab-other"${$.attr('aria-selected', activeTab === "other")} aria-controls="other-panel">Other Tab</button></div> <div id="popover-panel" role="tabpanel"${$.attr('hidden', activeTab !== "popover")} data-testid="panel-popover" style="padding-top: 120px; padding-left: 220px;">`);

		if (Popover.Root) {
			$$renderer.push('<!--[-->');

			Popover.Root($$renderer, {
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

						Popover.Portal($$renderer, {
							children: ($$renderer) => {
								if (Popover.Content) {
									$$renderer.push('<!--[-->');

									Popover.Content($$renderer, {
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

		$$renderer.push(`</div> <div id="other-panel" role="tabpanel"${$.attr('hidden', activeTab !== "other")} data-testid="panel-other"><div data-testid="outside">outside panel</div></div> <div data-testid="open-binding">${$.escape(open ? "true" : "false")}</div></main>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}