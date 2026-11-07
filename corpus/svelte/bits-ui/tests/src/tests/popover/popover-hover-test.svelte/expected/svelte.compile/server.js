import * as $ from 'svelte/internal/server';
import { Popover } from "bits-ui";

export default function Popover_hover_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			open = false,
			triggerProps,
			contentProps,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<main data-testid="main" style="display: flex; flex-direction: column; gap: 200px; padding: 20px;"><div>`);

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

								Popover.Trigger($$renderer, $.spread_props([
									{ 'data-testid': 'trigger' },
									triggerProps,
									{
										children: ($$renderer) => {
											$$renderer.push(`<!---->trigger`);
										},
										$$slots: { default: true }
									}
								]));

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

											Popover.Content($$renderer, $.spread_props([
												contentProps,
												{
													'data-testid': 'content',
													children: ($$renderer) => {
														$$renderer.push(`<div data-testid="content-text">content</div> <button data-testid="focusable-button">focusable button</button> <input data-testid="focusable-input" type="text" placeholder="input"/> `);

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
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <button data-testid="binding">${$.escape(open)}</button></div> <div data-testid="outside" style="padding: 20px; background: #eee;">outside</div></main>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { open });
	});
}