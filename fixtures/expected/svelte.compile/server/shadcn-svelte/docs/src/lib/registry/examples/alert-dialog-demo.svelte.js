import * as $ from 'svelte/internal/server';
import * as AlertDialog from "$lib/registry/ui/alert-dialog/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";

export default function Alert_dialog_demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (AlertDialog.Root) {
			$$renderer.push('<!--[-->');

			AlertDialog.Root($$renderer, {
				children: ($$renderer) => {
					if (AlertDialog.Trigger) {
						$$renderer.push('<!--[-->');

						AlertDialog.Trigger($$renderer, {
							class: buttonVariants({ variant: "outline" }),
							children: ($$renderer) => {
								$$renderer.push(`<!---->Show Dialog`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (AlertDialog.Content) {
						$$renderer.push('<!--[-->');

						AlertDialog.Content($$renderer, {
							children: ($$renderer) => {
								if (AlertDialog.Header) {
									$$renderer.push('<!--[-->');

									AlertDialog.Header($$renderer, {
										children: ($$renderer) => {
											if (AlertDialog.Title) {
												$$renderer.push('<!--[-->');

												AlertDialog.Title($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Are you absolutely sure?`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (AlertDialog.Description) {
												$$renderer.push('<!--[-->');

												AlertDialog.Description($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->This action cannot be undone. This will permanently delete your account and remove your data
				from our servers.`);
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

								if (AlertDialog.Footer) {
									$$renderer.push('<!--[-->');

									AlertDialog.Footer($$renderer, {
										children: ($$renderer) => {
											if (AlertDialog.Cancel) {
												$$renderer.push('<!--[-->');

												AlertDialog.Cancel($$renderer, {
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

											if (AlertDialog.Action) {
												$$renderer.push('<!--[-->');

												AlertDialog.Action($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Continue`);
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