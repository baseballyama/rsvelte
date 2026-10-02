import * as $ from 'svelte/internal/server';
import { Button, InputPassword } from '$lib/elements/forms';
import { Modal } from '$lib/components';
import { InputText } from '$lib/elements/forms';
import { base } from '$app/paths';
import { Icon, Layout, Selector, Button as PinkButton } from '@appwrite.io/pink-svelte';
import { Link } from '$lib/elements';
import { page } from '$app/state';
import { IconPlus, IconX } from '@appwrite.io/pink-icons-svelte';
import { validateVariables } from '$lib/helpers/variables';

export default function CreateVariableModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { show = false, variables = void 0, productLabel = 'site' } = $$props;
		let newVariables = [{ key: '', value: '' }];
		let secret = false;
		let error = '';

		function handleVariable() {
			try {
				if (secret) {
					newVariables = newVariables.map((variable) => ({ ...variable, secret: true }));
				}

				const validationError = validateVariables(newVariables.filter((variable) => variable.key || variable.value));

				if (validationError) {
					throw new Error(validationError);
				}

				const updatedVariables = [...variables];

				newVariables.forEach((newVar) => {
					if (!newVar.key) {
						return;
					}

					const existingIndex = updatedVariables.findIndex((v) => v.key === newVar.key);

					if (existingIndex !== -1) {
						updatedVariables[existingIndex] = { ...updatedVariables[existingIndex], ...newVar };
					} else {
						updatedVariables.push(newVar);
					}
				});

				variables = updatedVariables;
				show = false;
			} catch(e) {
				error = e.message;
			}
		}

		function removeVariable(index) {
			if (newVariables.length === 1) {
				newVariables = [{ key: '', value: '' }];
			} else {
				newVariables = newVariables.filter((_, i) => i !== index);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Modal($$renderer, {
				onSubmit: handleVariable,
				title: 'Create variables',
				get show() {
					return show;
				},

				set show($$value) {
					show = $$value;
					$$settled = false;
				},

				get error() {
					return error;
				},

				set error($$value) {
					error = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							gap: 'xxl',
							children: ($$renderer) => {
								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										gap: 'xs',
										children: ($$renderer) => {
											$$renderer.push(`<!--[-->`);

											const each_array = $.ensure_array_like(newVariables);

											for (let i = 0, $$length = each_array.length; i < $$length; i++) {
												let pair = each_array[i];

												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														direction: 'row',
														gap: 's',
														alignItems: 'flex-end',
														inline: true,
														children: ($$renderer) => {
															InputText($$renderer, {
																id: 'key',
																label: `${i === 0 ? 'Key' : ''}`,
																placeholder: 'ENTER_KEY',
																autocomplete: false,
																autofocus: true,
																get value() {
																	return pair.key;
																},

																set value($$value) {
																	pair.key = $$value;
																	$$settled = false;
																}
															});

															$$renderer.push(`<!----> `);

															InputPassword($$renderer, {
																id: 'value',
																label: `${i === 0 ? 'Value' : ''}`,
																placeholder: 'Enter value',
																minlength: 0,
																get value() {
																	return pair.value;
																},

																set value($$value) {
																	pair.value = $$value;
																	$$settled = false;
																}
															});

															$$renderer.push(`<!----> `);

															if (PinkButton.Button) {
																$$renderer.push('<!--[-->');

																PinkButton.Button($$renderer, {
																	icon: true,
																	variant: 'secondary',
																	type: 'button',
																	size: 's',
																	disabled: newVariables.length === 1 && !pair.key && !pair.value,
																	onclick: () => removeVariable(i),
																	children: ($$renderer) => {
																		Icon($$renderer, { icon: IconX });
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

											$$renderer.push(`<!--]--> <div>`);

											Button($$renderer, {
												text: true,
												compact: true,
												disabled: newVariables.some((pair) => !pair.key),
												children: ($$renderer) => {
													$$renderer.push(`<!---->Add variable`);
												},

												$$slots: {
													default: true,
													start: ($$renderer) => {
														Icon($$renderer, { slot: 'start', icon: IconPlus });
													}
												}
											});

											$$renderer.push(`<!----></div>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Selector.Checkbox) {
									$$renderer.push('<!--[-->');

									Selector.Checkbox($$renderer, {
										size: 's',
										id: 'secret',
										label: 'Secret',
										description: 'If selected, you and your team won\'t be able to read the values after creation.',
										get checked() {
											return secret;
										},

										set checked($$value) {
											secret = $$value;
											$$settled = false;
										}
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

				$$slots: {
					default: true,
					description: ($$renderer) => {
						$$renderer.push(`<span slot="description">Set the environment variables or secret that will be passed to your ${$.escape(productLabel)}. Global
        variables can be set in `);

						Link($$renderer, {
							variant: 'muted',
							href: `${base}/project-${page.params.region}-${page.params.project}/settings`,
							children: ($$renderer) => {
								$$renderer.push(`<!---->project settings`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->.</span>`);
					},

					footer: ($$renderer) => {
						{
							Button($$renderer, {
								secondary: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								submit: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Create`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}
					}
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { show, variables });
	});
}