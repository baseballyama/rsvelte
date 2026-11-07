import * as $ from 'svelte/internal/server';
import * as Add from '$lib/components/ui/add';

export default function Add_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { item, withoutRegistry = false } = $$props;

		$$renderer.push(`<div class="mt-6">`);

		if (Add.Root) {
			$$renderer.push('<!--[-->');

			Add.Root($$renderer, {
				item,
				withoutRegistry,
				children: ($$renderer) => {
					if (Add.Group) {
						$$renderer.push('<!--[-->');

						Add.Group($$renderer, {
							children: ($$renderer) => {
								if (Add.Button) {
									$$renderer.push('<!--[-->');
									Add.Button($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Add.GroupSeparator) {
									$$renderer.push('<!--[-->');
									Add.GroupSeparator($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Add.Dropdown) {
									$$renderer.push('<!--[-->');

									Add.Dropdown($$renderer, {
										children: ($$renderer) => {
											if (Add.DropdownContent) {
												$$renderer.push('<!--[-->');

												Add.DropdownContent($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!--[-->`);

														const each_array = $.ensure_array_like(Add.INSTALLERS);

														for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
															let installer = each_array[$$index];

															if (Add.DropdownInstallerOption) {
																$$renderer.push('<!--[-->');
																Add.DropdownInstallerOption($$renderer, { installer });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														}

														$$renderer.push(`<!--]--> `);

														if (Add.DropdownSeparator) {
															$$renderer.push('<!--[-->');
															Add.DropdownSeparator($$renderer, {});
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Add.DropdownCopyInit) {
															$$renderer.push('<!--[-->');
															Add.DropdownCopyInit($$renderer, {});
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Add.DropdownSeparator) {
															$$renderer.push('<!--[-->');
															Add.DropdownSeparator($$renderer, {});
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` <!--[-->`);

														const each_array_1 = $.ensure_array_like(Add.AGENTS);

														for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
															let agent = each_array_1[$$index_1];

															if (Add.DropdownAgentOption) {
																$$renderer.push('<!--[-->');
																Add.DropdownAgentOption($$renderer, { agent });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														}

														$$renderer.push(`<!--]--> `);

														if (Add.DropdownSeparator) {
															$$renderer.push('<!--[-->');
															Add.DropdownSeparator($$renderer, {});
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Add.DropdownDocsLink) {
															$$renderer.push('<!--[-->');
															Add.DropdownDocsLink($$renderer, {});
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
	});
}