import * as $ from 'svelte/internal/server';
import { Popover } from "bits-ui";

export default function Popover_scroll_jitter_test($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<main data-testid="main"><div data-testid="spacer-top" style="height: 720px;"></div> <div data-testid="anchor-zone" style="padding-left: 64px;">`);

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
										preventScroll: false,
										side: 'bottom',
										sideOffset: 8,
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

		$$renderer.push(`</div> <div data-testid="spacer-bottom" style="height: 2000px;"></div> <div data-testid="open-binding">${$.escape(open ? "true" : "false")}</div></main>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}