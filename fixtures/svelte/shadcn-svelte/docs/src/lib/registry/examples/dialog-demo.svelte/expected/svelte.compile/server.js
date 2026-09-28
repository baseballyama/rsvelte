import * as $ from 'svelte/internal/server';
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import { Button, buttonVariants } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Dialog_demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (Dialog.Root) {
			$$renderer.push('<!--[-->');

			Dialog.Root($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<form>`);

					if (Dialog.Trigger) {
						$$renderer.push('<!--[-->');

						Dialog.Trigger($$renderer, {
							type: 'button',
							class: buttonVariants({ variant: "outline" }),
							children: ($$renderer) => {
								$$renderer.push(`<!---->Open Dialog`);
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

								$$renderer.push(` <div class="grid gap-4"><div class="grid gap-3">`);

								Label($$renderer, {
									for: 'name-1',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Name`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);
								Input($$renderer, { id: 'name-1', name: 'name', defaultValue: 'Pedro Duarte' });
								$$renderer.push(`<!----></div> <div class="grid gap-3">`);

								Label($$renderer, {
									for: 'username-1',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Username`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Input($$renderer, {
									id: 'username-1',
									name: 'username',
									defaultValue: '@peduarte'
								});

								$$renderer.push(`<!----></div></div> `);

								if (Dialog.Footer) {
									$$renderer.push('<!--[-->');

									Dialog.Footer($$renderer, {
										children: ($$renderer) => {
											if (Dialog.Close) {
												$$renderer.push('<!--[-->');

												Dialog.Close($$renderer, {
													type: 'button',
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

											$$renderer.push(` `);

											Button($$renderer, {
												type: 'submit',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Save changes`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
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

					$$renderer.push(`</form>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}