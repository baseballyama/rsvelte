import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Empty from "$lib/registry/ui/empty/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Anomaly_alert($$renderer) {
	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			children: ($$renderer) => {
				if (Card.Content) {
					$$renderer.push('<!--[-->');

					Card.Content($$renderer, {
						children: ($$renderer) => {
							if (Empty.Root) {
								$$renderer.push('<!--[-->');

								Empty.Root($$renderer, {
									class: 'h-48',
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
}