import * as $ from 'svelte/internal/server';
import { useId } from "bits-ui";
import { Dialog } from "bits-ui";

export default function Dialog_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			open = false,
			contentProps = {},
			portalProps = {},
			titleProps = {},
			descriptionProps = {},
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let descriptionId = descriptionProps.id ?? useId();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<main>`);

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, $.spread_props([
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
							if (Dialog.Trigger) {
								$$renderer.push('<!--[-->');

								Dialog.Trigger($$renderer, {
									'data-testid': 'trigger',
									children: ($$renderer) => {
										$$renderer.push(`<!---->open`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Dialog.Portal) {
								$$renderer.push('<!--[-->');

								Dialog.Portal($$renderer, $.spread_props([
									portalProps,
									{
										children: ($$renderer) => {
											if (Dialog.Overlay) {
												$$renderer.push('<!--[-->');

												Dialog.Overlay($$renderer, {
													'data-testid': 'overlay',
													class: 'fixed inset-0 h-[100vh] w-[100vw] bg-black',
													children: ($$renderer) => {
														$$renderer.push(`<!---->overlay`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Dialog.Content) {
												$$renderer.push('<!--[-->');

												Dialog.Content($$renderer, $.spread_props([
													contentProps,
													{
														'data-testid': 'content',
														class: 'tranlate-x-[50%] fixed left-[50%] top-[50%] translate-y-[50%] bg-white p-1',
														children: ($$renderer) => {
															if (Dialog.Title) {
																$$renderer.push('<!--[-->');

																Dialog.Title($$renderer, $.spread_props([
																	titleProps,
																	{
																		'data-testid': 'title',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->title`);
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

															if (Dialog.Description) {
																$$renderer.push('<!--[-->');

																Dialog.Description($$renderer, $.spread_props([
																	descriptionProps,
																	{
																		id: descriptionId,
																		'data-testid': 'description',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->description`);
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

															if (Dialog.Close) {
																$$renderer.push('<!--[-->');

																Dialog.Close($$renderer, {
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

															$$renderer.push(` <button data-testid="update-id">Reactively update description id</button> <button data-testid="open-focus-override" id="open-focus-override">open focus override</button>`);
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

			$$renderer.push(` <p data-testid="binding">${$.escape(open)}</p> <button data-testid="toggle">toggle</button> <button data-testid="close-focus-override" id="close-focus-override">close focus override</button> <div data-testid="outside" style="bottom: 0px; right: 10px; position: absolute;">outside</div> <div id="portalTarget" data-testid="portalTarget"></div></main>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}