import * as $ from 'svelte/internal/server';
import * as Sheet from "$lib/registry/ui/sheet/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Sheet_demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (Sheet.Root) {
			$$renderer.push('<!--[-->');

			Sheet.Root($$renderer, {
				children: ($$renderer) => {
					if (Sheet.Trigger) {
						$$renderer.push('<!--[-->');

						Sheet.Trigger($$renderer, {
							class: buttonVariants({ variant: "outline" }),
							children: ($$renderer) => {
								$$renderer.push(`<!---->Open`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Sheet.Content) {
						$$renderer.push('<!--[-->');

						Sheet.Content($$renderer, {
							side: 'right',
							children: ($$renderer) => {
								if (Sheet.Header) {
									$$renderer.push('<!--[-->');

									Sheet.Header($$renderer, {
										children: ($$renderer) => {
											if (Sheet.Title) {
												$$renderer.push('<!--[-->');

												Sheet.Title($$renderer, {
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

											if (Sheet.Description) {
												$$renderer.push('<!--[-->');

												Sheet.Description($$renderer, {
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

								$$renderer.push(` <div class="grid flex-1 auto-rows-min gap-6 px-4"><div class="grid gap-3">`);

								Label($$renderer, {
									for: 'name',
									class: 'text-end',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Name`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);
								Input($$renderer, { id: 'name', value: 'Pedro Duarte' });
								$$renderer.push(`<!----></div> <div class="grid gap-3">`);

								Label($$renderer, {
									for: 'username',
									class: 'text-end',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Username`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);
								Input($$renderer, { id: 'username', value: '@peduarte' });
								$$renderer.push(`<!----></div></div> `);

								if (Sheet.Footer) {
									$$renderer.push('<!--[-->');

									Sheet.Footer($$renderer, {
										children: ($$renderer) => {
											Button($$renderer, {
												type: 'submit',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Save changes`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											if (Sheet.Close) {
												$$renderer.push('<!--[-->');

												Sheet.Close($$renderer, {
													class: buttonVariants({ variant: "outline" }),
													children: ($$renderer) => {
														$$renderer.push(`<!---->Close`);
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
	});
}