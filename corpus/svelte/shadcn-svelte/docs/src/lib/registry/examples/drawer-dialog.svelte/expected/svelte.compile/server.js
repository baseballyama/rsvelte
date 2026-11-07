import * as $ from 'svelte/internal/server';
import { MediaQuery } from "svelte/reactivity";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as Drawer from "$lib/registry/ui/drawer/index.js";
import { Button, buttonVariants } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Drawer_dialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = $.props_id($$renderer);
		let open = false;
		const isDesktop = new MediaQuery("(min-width: 768px)");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (isDesktop.current) {
				$$renderer.push('<!--[0-->');

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
							if (Dialog.Trigger) {
								$$renderer.push('<!--[-->');

								Dialog.Trigger($$renderer, {
									class: buttonVariants({ variant: "outline" }),
									children: ($$renderer) => {
										$$renderer.push(`<!---->Edit Profile`);
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

								Dialog.Content($$renderer, {
									class: 'sm:max-w-[425px]',
									children: ($$renderer) => {
										if (Dialog.Header) {
											$$renderer.push('<!--[-->');

											Dialog.Header($$renderer, {
												children: ($$renderer) => {
													if (Dialog.Title) {
														$$renderer.push('<!--[-->');

														Dialog.Title($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Edit profile`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Dialog.Description) {
														$$renderer.push('<!--[-->');

														Dialog.Description($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Make changes to your profile here. Click save when you're done.`);
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

										$$renderer.push(` <form class="grid items-start gap-4"><div class="grid gap-2">`);

										Label($$renderer, {
											for: `email-${id}`,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Email`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											type: 'email',
											id: `email-${id}`,
											value: 'shadcn@example.com'
										});

										$$renderer.push(`<!----></div> <div class="grid gap-2">`);

										Label($$renderer, {
											for: `username-${id}`,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Username`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);
										Input($$renderer, { id: `username-${id}`, value: '@shadcn' });
										$$renderer.push(`<!----></div> `);

										Button($$renderer, {
											type: 'submit',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Save changes`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></form>`);
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
			} else {
				$$renderer.push('<!--[-1-->');

				if (Drawer.Root) {
					$$renderer.push('<!--[-->');

					Drawer.Root($$renderer, {
						get open() {
							return open;
						},

						set open($$value) {
							open = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Drawer.Trigger) {
								$$renderer.push('<!--[-->');

								Drawer.Trigger($$renderer, {
									class: buttonVariants({ variant: "outline" }),
									children: ($$renderer) => {
										$$renderer.push(`<!---->Edit Profile`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Drawer.Content) {
								$$renderer.push('<!--[-->');

								Drawer.Content($$renderer, {
									children: ($$renderer) => {
										if (Drawer.Header) {
											$$renderer.push('<!--[-->');

											Drawer.Header($$renderer, {
												class: 'text-start',
												children: ($$renderer) => {
													if (Drawer.Title) {
														$$renderer.push('<!--[-->');

														Drawer.Title($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Edit profile`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Drawer.Description) {
														$$renderer.push('<!--[-->');

														Drawer.Description($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Make changes to your profile here. Click save when you're done.`);
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

										$$renderer.push(` <form class="grid items-start gap-4 px-4"><div class="grid gap-2">`);

										Label($$renderer, {
											for: `email-${id}`,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Email`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											type: 'email',
											id: `email-${id}`,
											value: 'shadcn@example.com'
										});

										$$renderer.push(`<!----></div> <div class="grid gap-2">`);

										Label($$renderer, {
											for: `username-${id}`,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Username`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);
										Input($$renderer, { id: `username-${id}`, value: '@shadcn' });
										$$renderer.push(`<!----></div> `);

										Button($$renderer, {
											type: 'submit',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Save changes`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></form> `);

										if (Drawer.Footer) {
											$$renderer.push('<!--[-->');

											Drawer.Footer($$renderer, {
												class: 'pt-2',
												children: ($$renderer) => {
													if (Drawer.Close) {
														$$renderer.push('<!--[-->');

														Drawer.Close($$renderer, {
															class: buttonVariants({ variant: "outline" }),
															children: ($$renderer) => {
																$$renderer.push(`<!---->Cancel`);
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

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}