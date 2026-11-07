import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";

export default function Field_field_group_demo($$renderer) {
	$$renderer.push(`<div class="w-full max-w-md">`);

	if (Field.Group) {
		$$renderer.push('<!--[-->');

		Field.Group($$renderer, {
			children: ($$renderer) => {
				if (Field.Set) {
					$$renderer.push('<!--[-->');

					Field.Set($$renderer, {
						children: ($$renderer) => {
							if (Field.Label) {
								$$renderer.push('<!--[-->');

								Field.Label($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Responses`);
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
										$$renderer.push(`<!---->Get notified when ChatGPT responds to requests that take time, like research or image
				generation.`);
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
									'data-slot': 'checkbox-group',
									children: ($$renderer) => {
										if (Field.Field) {
											$$renderer.push('<!--[-->');

											Field.Field($$renderer, {
												orientation: 'horizontal',
												children: ($$renderer) => {
													Checkbox($$renderer, { id: 'push', checked: true, disabled: true });
													$$renderer.push(`<!----> `);

													if (Field.Label) {
														$$renderer.push('<!--[-->');

														Field.Label($$renderer, {
															for: 'push',
															class: 'font-normal',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Push notifications`);
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

				if (Field.Set) {
					$$renderer.push('<!--[-->');

					Field.Set($$renderer, {
						children: ($$renderer) => {
							if (Field.Label) {
								$$renderer.push('<!--[-->');

								Field.Label($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Tasks`);
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
										$$renderer.push(`<!---->Get notified when tasks you've created have updates. <a href="#/">Manage tasks</a>`);
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
									'data-slot': 'checkbox-group',
									children: ($$renderer) => {
										if (Field.Field) {
											$$renderer.push('<!--[-->');

											Field.Field($$renderer, {
												orientation: 'horizontal',
												children: ($$renderer) => {
													Checkbox($$renderer, { id: 'push-tasks' });
													$$renderer.push(`<!----> `);

													if (Field.Label) {
														$$renderer.push('<!--[-->');

														Field.Label($$renderer, {
															for: 'push-tasks',
															class: 'font-normal',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Push notifications`);
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
													Checkbox($$renderer, { id: 'email-tasks' });
													$$renderer.push(`<!----> `);

													if (Field.Label) {
														$$renderer.push('<!--[-->');

														Field.Label($$renderer, {
															for: 'email-tasks',
															class: 'font-normal',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Email notifications`);
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

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</div>`);
}