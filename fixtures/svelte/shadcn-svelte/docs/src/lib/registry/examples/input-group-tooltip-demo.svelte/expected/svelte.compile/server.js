import * as $ from 'svelte/internal/server';
import HelpCircleIcon from "@lucide/svelte/icons/help-circle";
import InfoIcon from "@lucide/svelte/icons/info";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";

export default function Input_group_tooltip_demo($$renderer) {
	$$renderer.push(`<div class="grid w-full max-w-sm gap-4">`);

	if (InputGroup.Root) {
		$$renderer.push('<!--[-->');

		InputGroup.Root($$renderer, {
			children: ($$renderer) => {
				if (InputGroup.Input) {
					$$renderer.push('<!--[-->');
					InputGroup.Input($$renderer, { placeholder: 'Enter password', type: 'password' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (InputGroup.Addon) {
					$$renderer.push('<!--[-->');

					InputGroup.Addon($$renderer, {
						align: 'inline-end',
						children: ($$renderer) => {
							if (Tooltip.Root) {
								$$renderer.push('<!--[-->');

								Tooltip.Root($$renderer, {
									children: ($$renderer) => {
										{
											function child($$renderer, { props }) {
												if (InputGroup.Button) {
													$$renderer.push('<!--[-->');

													InputGroup.Button($$renderer, $.spread_props([
														props,
														{
															variant: 'ghost',
															'aria-label': 'Info',
															size: 'icon-xs',
															children: ($$renderer) => {
																InfoIcon($$renderer, {});
															},
															$$slots: { default: true }
														}
													]));

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											if (Tooltip.Trigger) {
												$$renderer.push('<!--[-->');
												Tooltip.Trigger($$renderer, { child, $$slots: { child: true } });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(` `);

										if (Tooltip.Content) {
											$$renderer.push('<!--[-->');

											Tooltip.Content($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<p>Password must be at least 8 characters</p>`);
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

	$$renderer.push(` `);

	if (InputGroup.Root) {
		$$renderer.push('<!--[-->');

		InputGroup.Root($$renderer, {
			children: ($$renderer) => {
				if (InputGroup.Input) {
					$$renderer.push('<!--[-->');
					InputGroup.Input($$renderer, { placeholder: 'Your email address' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (InputGroup.Addon) {
					$$renderer.push('<!--[-->');

					InputGroup.Addon($$renderer, {
						align: 'inline-end',
						children: ($$renderer) => {
							if (Tooltip.Root) {
								$$renderer.push('<!--[-->');

								Tooltip.Root($$renderer, {
									children: ($$renderer) => {
										{
											function child($$renderer, { props }) {
												if (InputGroup.Button) {
													$$renderer.push('<!--[-->');

													InputGroup.Button($$renderer, $.spread_props([
														props,
														{
															variant: 'ghost',
															'aria-label': 'Help',
															size: 'icon-xs',
															children: ($$renderer) => {
																HelpCircleIcon($$renderer, {});
															},
															$$slots: { default: true }
														}
													]));

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											if (Tooltip.Trigger) {
												$$renderer.push('<!--[-->');
												Tooltip.Trigger($$renderer, { child, $$slots: { child: true } });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(` `);

										if (Tooltip.Content) {
											$$renderer.push('<!--[-->');

											Tooltip.Content($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<p>We'll use this to send you notifications</p>`);
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

	$$renderer.push(` `);

	if (InputGroup.Root) {
		$$renderer.push('<!--[-->');

		InputGroup.Root($$renderer, {
			children: ($$renderer) => {
				if (InputGroup.Input) {
					$$renderer.push('<!--[-->');
					InputGroup.Input($$renderer, { placeholder: 'Enter API key' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Tooltip.Root) {
					$$renderer.push('<!--[-->');

					Tooltip.Root($$renderer, {
						children: ($$renderer) => {
							{
								function child($$renderer, { props }) {
									if (InputGroup.Addon) {
										$$renderer.push('<!--[-->');

										InputGroup.Addon($$renderer, {
											children: ($$renderer) => {
												if (InputGroup.Button) {
													$$renderer.push('<!--[-->');

													InputGroup.Button($$renderer, $.spread_props([
														props,
														{
															variant: 'ghost',
															'aria-label': 'Help',
															size: 'icon-xs',
															children: ($$renderer) => {
																HelpCircleIcon($$renderer, {});
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
								}

								if (Tooltip.Trigger) {
									$$renderer.push('<!--[-->');
									Tooltip.Trigger($$renderer, { child, $$slots: { child: true } });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(` `);

							if (Tooltip.Content) {
								$$renderer.push('<!--[-->');

								Tooltip.Content($$renderer, {
									side: 'left',
									children: ($$renderer) => {
										$$renderer.push(`<p>Click for help with API keys</p>`);
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

	$$renderer.push(`</div>`);
}