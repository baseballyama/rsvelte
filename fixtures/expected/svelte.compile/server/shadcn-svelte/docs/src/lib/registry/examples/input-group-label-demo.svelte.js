import * as $ from 'svelte/internal/server';
import InfoIcon from "@lucide/svelte/icons/info";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Label from "$lib/registry/ui/label/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";

export default function Input_group_label_demo($$renderer) {
	$$renderer.push(`<div class="grid w-full max-w-sm gap-4">`);

	if (InputGroup.Root) {
		$$renderer.push('<!--[-->');

		InputGroup.Root($$renderer, {
			children: ($$renderer) => {
				if (InputGroup.Input) {
					$$renderer.push('<!--[-->');
					InputGroup.Input($$renderer, { id: 'email', placeholder: 'shadcn' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (InputGroup.Addon) {
					$$renderer.push('<!--[-->');

					InputGroup.Addon($$renderer, {
						children: ($$renderer) => {
							if (Label.Root) {
								$$renderer.push('<!--[-->');

								Label.Root($$renderer, {
									for: 'email',
									children: ($$renderer) => {
										$$renderer.push(`<!---->@`);
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
					InputGroup.Input($$renderer, { id: 'email-2', placeholder: 'shadcn@vercel.com' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (InputGroup.Addon) {
					$$renderer.push('<!--[-->');

					InputGroup.Addon($$renderer, {
						align: 'block-start',
						children: ($$renderer) => {
							if (Label.Root) {
								$$renderer.push('<!--[-->');

								Label.Root($$renderer, {
									for: 'email-2',
									class: 'text-foreground',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Email`);
									},
									$$slots: { default: true }
								});

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
												if (InputGroup.Button) {
													$$renderer.push('<!--[-->');

													InputGroup.Button($$renderer, $.spread_props([
														props,
														{
															variant: 'ghost',
															'aria-label': 'Help',
															class: 'ms-auto rounded-full',
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

	$$renderer.push(`</div>`);
}