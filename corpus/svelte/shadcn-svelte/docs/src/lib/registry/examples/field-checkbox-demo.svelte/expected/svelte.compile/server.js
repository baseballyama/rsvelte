import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";

export default function Field_checkbox_demo($$renderer) {
	$$renderer.push(`<div class="w-full max-w-md">`);

	if (Field.Group) {
		$$renderer.push('<!--[-->');

		Field.Group($$renderer, {
			children: ($$renderer) => {
				if (Field.Set) {
					$$renderer.push('<!--[-->');

					Field.Set($$renderer, {
						children: ($$renderer) => {
							if (Field.Legend) {
								$$renderer.push('<!--[-->');

								Field.Legend($$renderer, {
									variant: 'label',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Show these items on the desktop`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Field.Description) {
								$$renderer.push('<!--[-->');

								Field.Description($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Select the items you want to show on the desktop.`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Field.Group) {
								$$renderer.push('<!--[-->');

								Field.Group($$renderer, {
									class: 'gap-3',
									children: ($$renderer) => {
										if (Field.Field) {
											$$renderer.push('<!--[-->');

											Field.Field($$renderer, {
												orientation: 'horizontal',
												children: ($$renderer) => {
													Checkbox($$renderer, { id: 'finder-pref-9k2-hard-disks-ljj', checked: true });
													$$renderer.push(`<!----> `);

													if (Field.Label) {
														$$renderer.push('<!--[-->');

														Field.Label($$renderer, {
															for: 'finder-pref-9k2-hard-disks-ljj',
															class: 'font-normal',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Hard disks`);
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

										if (Field.Field) {
											$$renderer.push('<!--[-->');

											Field.Field($$renderer, {
												orientation: 'horizontal',
												children: ($$renderer) => {
													Checkbox($$renderer, { id: 'finder-pref-9k2-external-disks-1yg' });
													$$renderer.push(`<!----> `);

													if (Field.Label) {
														$$renderer.push('<!--[-->');

														Field.Label($$renderer, {
															for: 'finder-pref-9k2-external-disks-1yg',
															class: 'font-normal',
															children: ($$renderer) => {
																$$renderer.push(`<!---->External disks`);
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

										if (Field.Field) {
											$$renderer.push('<!--[-->');

											Field.Field($$renderer, {
												orientation: 'horizontal',
												children: ($$renderer) => {
													Checkbox($$renderer, { id: 'finder-pref-9k2-cds-dvds-fzt' });
													$$renderer.push(`<!----> `);

													if (Field.Label) {
														$$renderer.push('<!--[-->');

														Field.Label($$renderer, {
															for: 'finder-pref-9k2-cds-dvds-fzt',
															class: 'font-normal',
															children: ($$renderer) => {
																$$renderer.push(`<!---->CDs, DVDs, and iPods`);
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

										if (Field.Field) {
											$$renderer.push('<!--[-->');

											Field.Field($$renderer, {
												orientation: 'horizontal',
												children: ($$renderer) => {
													Checkbox($$renderer, { id: 'finder-pref-9k2-connected-servers-6l2' });
													$$renderer.push(`<!----> `);

													if (Field.Label) {
														$$renderer.push('<!--[-->');

														Field.Label($$renderer, {
															for: 'finder-pref-9k2-connected-servers-6l2',
															class: 'font-normal',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Connected servers`);
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

				$$renderer.push(` `);

				if (Field.Separator) {
					$$renderer.push('<!--[-->');
					Field.Separator($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Field.Field) {
					$$renderer.push('<!--[-->');

					Field.Field($$renderer, {
						orientation: 'horizontal',
						children: ($$renderer) => {
							Checkbox($$renderer, { id: 'finder-pref-9k2-sync-folders-nep', checked: true });
							$$renderer.push(`<!----> `);

							if (Field.Content) {
								$$renderer.push('<!--[-->');

								Field.Content($$renderer, {
									children: ($$renderer) => {
										if (Field.Label) {
											$$renderer.push('<!--[-->');

											Field.Label($$renderer, {
												for: 'finder-pref-9k2-sync-folders-nep',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Sync Desktop &amp; Documents folders`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Field.Description) {
											$$renderer.push('<!--[-->');

											Field.Description($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Your Desktop &amp; Documents folders are being synced with iCloud Drive. You can access them
					from other devices.`);
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