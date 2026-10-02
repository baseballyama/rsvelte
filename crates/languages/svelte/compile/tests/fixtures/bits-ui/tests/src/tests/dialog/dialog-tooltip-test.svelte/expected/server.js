import * as $ from 'svelte/internal/server';
import { Tooltip, Dialog } from "bits-ui";

export default function Dialog_tooltip_test($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (Tooltip.Provider) {
			$$renderer.push('<!--[-->');

			Tooltip.Provider($$renderer, {
				children: ($$renderer) => {
					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');

						Tooltip.Root($$renderer, {
							delayDuration: 200,
							disableCloseOnTriggerClick: true,
							children: ($$renderer) => {
								if (Tooltip.Trigger) {
									$$renderer.push('<!--[-->');

									Tooltip.Trigger($$renderer, {
										'data-testid': 'trigger',
										onclick: () => open = true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Hover Me &amp; Then Click`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Tooltip.Content) {
									$$renderer.push('<!--[-->');

									Tooltip.Content($$renderer, {
										'data-testid': 'tooltip-content',
										children: ($$renderer) => {
											$$renderer.push(`<div>Tooltip Content</div>`);
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

					if (Dialog.Root) {
						$$renderer.push('<!--[-->');

						Dialog.Root($$renderer, {
							get open() {
								return open;
							},

							set open($$value) {
								open = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Dialog.Portal) {
									$$renderer.push('<!--[-->');

									Dialog.Portal($$renderer, {
										children: ($$renderer) => {
											if (Dialog.Content) {
												$$renderer.push('<!--[-->');

												Dialog.Content($$renderer, {
													'data-testid': 'dialog-content',
													children: ($$renderer) => {
														$$renderer.push(`<p>Dialog Content</p> <p>Click "Close" to close dialog and hover tooltip again. The tooltip will not
					appear.</p> `);

														if (Dialog.Close) {
															$$renderer.push('<!--[-->');

															Dialog.Close($$renderer, {
																'data-testid': 'dialog-close',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Close`);
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

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}