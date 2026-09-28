import * as $ from 'svelte/internal/server';
import * as Sheet from "$lib/registry/ui/sheet/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Sheet_no_close_button($$renderer) {
	Example($$renderer, {
		title: 'No Close Button',
		children: ($$renderer) => {
			if (Sheet.Root) {
				$$renderer.push('<!--[-->');

				Sheet.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									{ variant: 'outline' },
									props,
									{
										children: ($$renderer) => {
											$$renderer.push(`<!---->No Close Button`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Sheet.Trigger) {
								$$renderer.push('<!--[-->');
								Sheet.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Sheet.Content) {
							$$renderer.push('<!--[-->');

							Sheet.Content($$renderer, {
								showCloseButton: false,
								children: ($$renderer) => {
									if (Sheet.Header) {
										$$renderer.push('<!--[-->');

										Sheet.Header($$renderer, {
											children: ($$renderer) => {
												if (Sheet.Title) {
													$$renderer.push('<!--[-->');

													Sheet.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->No Close Button`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Sheet.Description) {
													$$renderer.push('<!--[-->');

													Sheet.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->This sheet doesn't have a close button in the top-right corner. You can only close it
					using the button below.`);
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
}