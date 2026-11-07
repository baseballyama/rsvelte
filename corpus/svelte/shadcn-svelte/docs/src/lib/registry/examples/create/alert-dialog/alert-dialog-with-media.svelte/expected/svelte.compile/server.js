import * as $ from 'svelte/internal/server';
import * as AlertDialog from "$lib/registry/ui/alert-dialog/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Alert_dialog_with_media($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'With Media',
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
											variant: 'outline',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Default (Media)`);
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
									children: ($$renderer) => {
										if (AlertDialog.Header) {
											$$renderer.push('<!--[-->');

											AlertDialog.Header($$renderer, {
												children: ($$renderer) => {
													if (AlertDialog.Media) {
														$$renderer.push('<!--[-->');

														AlertDialog.Media($$renderer, {
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'BluetoothIcon',
																	tabler: 'IconBluetooth',
																	hugeicons: 'BluetoothIcon',
																	phosphor: 'BluetoothIcon',
																	remixicon: 'RiBluetoothLine'
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
																$$renderer.push(`<!---->This will permanently delete your account and remove your data from our servers.`);
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
															onclick: () => open = false,
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