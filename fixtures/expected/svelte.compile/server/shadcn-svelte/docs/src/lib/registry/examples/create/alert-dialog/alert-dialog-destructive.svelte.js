import * as $ from 'svelte/internal/server';
import * as AlertDialog from "$lib/registry/ui/alert-dialog/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Alert_dialog_destructive($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'Destructive',
			class: 'items-center',
			children: ($$renderer) => {
				if (AlertDialog.Root) {
					$$renderer.push('<!--[-->');

					AlertDialog.Root($$renderer, {
						get open() {
							return open;
						},

						set open($$value) {
							open = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (AlertDialog.Trigger) {
								$$renderer.push('<!--[-->');

								AlertDialog.Trigger($$renderer, {
									children: ($$renderer) => {
										Button($$renderer, {
											variant: 'destructive',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Delete Chat`);
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

							$$renderer.push(` `);

							if (AlertDialog.Content) {
								$$renderer.push('<!--[-->');

								AlertDialog.Content($$renderer, {
									size: 'sm',
									children: ($$renderer) => {
										if (AlertDialog.Header) {
											$$renderer.push('<!--[-->');

											AlertDialog.Header($$renderer, {
												children: ($$renderer) => {
													if (AlertDialog.Media) {
														$$renderer.push('<!--[-->');

														AlertDialog.Media($$renderer, {
															class: 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive',
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'Trash2Icon',
																	tabler: 'IconTrash',
																	hugeicons: 'Delete02Icon',
																	phosphor: 'TrashIcon',
																	remixicon: 'RiDeleteBinLine'
																});
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (AlertDialog.Title) {
														$$renderer.push('<!--[-->');

														AlertDialog.Title($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Delete chat?`);
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
																$$renderer.push(`<!---->This will permanently delete this chat conversation. View <a href="#/">Settings</a> delete any memories saved during this chat.`);
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
															variant: 'ghost',
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
															variant: 'destructive',
															onclick: () => open = false,
															children: ($$renderer) => {
																$$renderer.push(`<!---->Delete`);
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

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}