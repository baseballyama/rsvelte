import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Tabs_demo($$renderer) {
	$$renderer.push(`<div class="-mb-4 flex w-full max-w-sm flex-col gap-6">`);

	if (Tabs.Root) {
		$$renderer.push('<!--[-->');

		Tabs.Root($$renderer, {
			value: 'account',
			children: ($$renderer) => {
				if (Tabs.List) {
					$$renderer.push('<!--[-->');

					Tabs.List($$renderer, {
						children: ($$renderer) => {
							if (Tabs.Trigger) {
								$$renderer.push('<!--[-->');

								Tabs.Trigger($$renderer, {
									value: 'account',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Account`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Tabs.Trigger) {
								$$renderer.push('<!--[-->');

								Tabs.Trigger($$renderer, {
									value: 'password',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Password`);
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

				if (Tabs.Content) {
					$$renderer.push('<!--[-->');

					Tabs.Content($$renderer, {
						value: 'account',
						children: ($$renderer) => {
							if (Card.Root) {
								$$renderer.push('<!--[-->');

								Card.Root($$renderer, {
									children: ($$renderer) => {
										if (Card.Header) {
											$$renderer.push('<!--[-->');

											Card.Header($$renderer, {
												children: ($$renderer) => {
													if (Card.Title) {
														$$renderer.push('<!--[-->');

														Card.Title($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Account`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Card.Description) {
														$$renderer.push('<!--[-->');

														Card.Description($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Make changes to your account here. Click save when you're done.`);
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

										if (Card.Content) {
											$$renderer.push('<!--[-->');

											Card.Content($$renderer, {
												class: 'grid gap-6',
												children: ($$renderer) => {
													$$renderer.push(`<div class="grid gap-3">`);

													Label($$renderer, {
														for: 'tabs-demo-name',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Name`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);
													Input($$renderer, { id: 'tabs-demo-name', value: 'Pedro Duarte' });
													$$renderer.push(`<!----></div> <div class="grid gap-3">`);

													Label($$renderer, {
														for: 'tabs-demo-username',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Username`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);
													Input($$renderer, { id: 'tabs-demo-username', value: '@peduarte' });
													$$renderer.push(`<!----></div>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Card.Footer) {
											$$renderer.push('<!--[-->');

											Card.Footer($$renderer, {
												children: ($$renderer) => {
													Button($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Save changes`);
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

				$$renderer.push(` `);

				if (Tabs.Content) {
					$$renderer.push('<!--[-->');

					Tabs.Content($$renderer, {
						value: 'password',
						children: ($$renderer) => {
							if (Card.Root) {
								$$renderer.push('<!--[-->');

								Card.Root($$renderer, {
									children: ($$renderer) => {
										if (Card.Header) {
											$$renderer.push('<!--[-->');

											Card.Header($$renderer, {
												children: ($$renderer) => {
													if (Card.Title) {
														$$renderer.push('<!--[-->');

														Card.Title($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Password`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Card.Description) {
														$$renderer.push('<!--[-->');

														Card.Description($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Change your password here. After saving, you'll be logged out.`);
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

										if (Card.Content) {
											$$renderer.push('<!--[-->');

											Card.Content($$renderer, {
												class: 'grid gap-6',
												children: ($$renderer) => {
													$$renderer.push(`<div class="grid gap-3">`);

													Label($$renderer, {
														for: 'tabs-demo-current',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Current password`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);
													Input($$renderer, { id: 'tabs-demo-current', type: 'password' });
													$$renderer.push(`<!----></div> <div class="grid gap-3">`);

													Label($$renderer, {
														for: 'tabs-demo-new',
														children: ($$renderer) => {
															$$renderer.push(`<!---->New password`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);
													Input($$renderer, { id: 'tabs-demo-new', type: 'password' });
													$$renderer.push(`<!----></div>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Card.Footer) {
											$$renderer.push('<!--[-->');

											Card.Footer($$renderer, {
												children: ($$renderer) => {
													Button($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Save password`);
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

	$$renderer.push(`</div>`);
}