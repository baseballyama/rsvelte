import * as $ from 'svelte/internal/server';
import { FileUpload } from '@skeletonlabs/skeleton-svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		FileUpload($$renderer, {
			children: ($$renderer) => {
				if (FileUpload.Label) {
					$$renderer.push('<!--[-->');

					FileUpload.Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Label`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (FileUpload.Dropzone) {
					$$renderer.push('<!--[-->');

					FileUpload.Dropzone($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<div>Select file or drag here.</div> `);

							if (FileUpload.Trigger) {
								$$renderer.push('<!--[-->');

								FileUpload.Trigger($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Browse Files`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (FileUpload.HiddenInput) {
								$$renderer.push('<!--[-->');
								FileUpload.HiddenInput($$renderer, {});
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

				if (FileUpload.ItemGroup) {
					$$renderer.push('<!--[-->');

					FileUpload.ItemGroup($$renderer, {
						children: ($$renderer) => {
							{
								function children($$renderer, fileUpload) {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(fileUpload().acceptedFiles);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let file = each_array[$$index];

										if (FileUpload.Item) {
											$$renderer.push('<!--[-->');

											FileUpload.Item($$renderer, {
												file,
												children: ($$renderer) => {
													if (FileUpload.ItemName) {
														$$renderer.push('<!--[-->');

														FileUpload.ItemName($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(file.name)}`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (FileUpload.ItemSizeText) {
														$$renderer.push('<!--[-->');

														FileUpload.ItemSizeText($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(file.size)} bytes`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (FileUpload.ItemDeleteTrigger) {
														$$renderer.push('<!--[-->');
														FileUpload.ItemDeleteTrigger($$renderer, {});
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

								if (FileUpload.Context) {
									$$renderer.push('<!--[-->');
									FileUpload.Context($$renderer, { children, $$slots: { default: true } });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
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

				if (FileUpload.ClearTrigger) {
					$$renderer.push('<!--[-->');

					FileUpload.ClearTrigger($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Clear Files`);
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
	});
}