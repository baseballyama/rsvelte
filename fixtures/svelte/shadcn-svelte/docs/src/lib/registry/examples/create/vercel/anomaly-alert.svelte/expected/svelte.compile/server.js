import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Empty from "$lib/registry/ui/empty/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Anomaly_alert($$renderer) {
	Example($$renderer, {
		title: 'Anomaly Alert',
		class: 'items-center justify-center',
		children: ($$renderer) => {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					class: 'w-full max-w-xs',
					children: ($$renderer) => {
						if (Card.Content) {
							$$renderer.push('<!--[-->');

							Card.Content($$renderer, {
								class: 'p-6',
								children: ($$renderer) => {
									if (Empty.Root) {
										$$renderer.push('<!--[-->');

										Empty.Root($$renderer, {
											class: 'mx-auto p-0',
											children: ($$renderer) => {
												if (Empty.Header) {
													$$renderer.push('<!--[-->');

													Empty.Header($$renderer, {
														children: ($$renderer) => {
															if (Empty.Title) {
																$$renderer.push('<!--[-->');

																Empty.Title($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Get alerted for anomalies`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Empty.Description) {
																$$renderer.push('<!--[-->');

																Empty.Description($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Automatically monitor your projects for anomalies and get notified.`);
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

												if (Empty.Content) {
													$$renderer.push('<!--[-->');

													Empty.Content($$renderer, {
														children: ($$renderer) => {
															Button($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Upgrade to Observability Plus`);
																},
																$$slots: { default: true }
															});
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