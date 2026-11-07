import * as $ from 'svelte/internal/server';

import {
	mdiAccount,
	mdiAccountMultipleOutline,
	mdiAccountOutline,
	mdiChevronDown
} from '@mdi/js';

import {
	Button,
	Checkbox,
	Field,
	Icon,
	Input,
	Switch,
	ToggleGroup,
	ToggleOption
} from 'svelte-ux';

import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	let group = [];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<h1>Examples</h1> <h2>Text (display only) as value</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid grid-flow-col gap-2">`);
				Field($$renderer, { label: 'First Name', value: 'Sean' });
				$$renderer.push(`<!----> `);
				Field($$renderer, { label: 'Last Name', value: 'Lynch' });
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Text (display only) as slot</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid grid-flow-col gap-2">`);

				Field($$renderer, {
					label: 'First Name',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Sean`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Field($$renderer, {
					label: 'Last Name',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Lynch`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Empty (null / undefined)</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid grid-flow-col gap-2">`);
				Field($$renderer, { label: 'First name', value: null });
				$$renderer.push(`<!----> `);
				Field($$renderer, { label: 'Last name', value: undefined });
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Placeholder</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid grid-flow-col gap-2">`);
				Field($$renderer, { label: 'First name', value: null, placeholder: 'empty' });
				$$renderer.push(`<!----> `);
				Field($$renderer, { label: 'Last name', value: undefined, placeholder: 'empty' });
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Switch</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Field($$renderer, {
					label: 'Is Active',
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { id }) => {
							Switch($$renderer, { id });
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Checkbox</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Field($$renderer, {
					label: 'Fruits',
					classes: { input: 'flex flex-col gap-3' },
					clearable: true,
					get value() {
						return group;
					},

					set value($$value) {
						group = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						Checkbox($$renderer, {
							value: 'apple',
							class: 'w-full',
							get group() {
								return group;
							},

							set group($$value) {
								group = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								$$renderer.push(`<!---->Apple`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Checkbox($$renderer, {
							value: 'banana',
							class: 'w-full',
							get group() {
								return group;
							},

							set group($$value) {
								group = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								$$renderer.push(`<!---->Banana`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Checkbox($$renderer, {
							value: 'strawberry',
							class: 'w-full',
							get group() {
								return group;
							},

							set group($$value) {
								group = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								$$renderer.push(`<!---->Strawberry`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Checkbox w/ error</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Field($$renderer, {
					label: 'Fruits',
					classes: { input: 'flex flex-col gap-3' },
					clearable: true,
					error: true,
					get value() {
						return group;
					},

					set value($$value) {
						group = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						Checkbox($$renderer, {
							value: 'apple',
							class: 'w-full',
							get group() {
								return group;
							},

							set group($$value) {
								group = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								$$renderer.push(`<!---->Apple`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Checkbox($$renderer, {
							value: 'banana',
							class: 'w-full',
							get group() {
								return group;
							},

							set group($$value) {
								group = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								$$renderer.push(`<!---->Banana`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Checkbox($$renderer, {
							value: 'strawberry',
							class: 'w-full',
							get group() {
								return group;
							},

							set group($$value) {
								group = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								$$renderer.push(`<!---->Strawberry`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="grid grid-cols-2 gap-2"><div><div class="text-lg font-semibold mt-8 ml-2">ToggleGroup</div> <div class="text-xs font-semibold text-surface-content/50 mb-1 ml-2">default width</div> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Field($$renderer, {
					label: 'Is Active',
					children: ($$renderer) => {
						ToggleGroup($$renderer, {
							variant: 'outline',
							inset: true,
							children: ($$renderer) => {
								ToggleOption($$renderer, {
									value: 'yes',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Yes`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								ToggleOption($$renderer, {
									value: 'no',
									children: ($$renderer) => {
										$$renderer.push(`<!---->No`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								ToggleOption($$renderer, {
									value: 'all',
									children: ($$renderer) => {
										$$renderer.push(`<!---->All`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div><div class="text-lg font-semibold mt-8 ml-2">ToggleGroup</div> <div class="text-xs font-semibold text-surface-content/50 mb-1 ml-2">full width</div> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Field($$renderer, {
					label: 'Is Active',
					children: ($$renderer) => {
						ToggleGroup($$renderer, {
							variant: 'outline',
							inset: true,
							class: 'w-full',
							children: ($$renderer) => {
								ToggleOption($$renderer, {
									value: 'yes',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Yes`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								ToggleOption($$renderer, {
									value: 'no',
									children: ($$renderer) => {
										$$renderer.push(`<!---->No`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								ToggleOption($$renderer, {
									value: 'all',
									children: ($$renderer) => {
										$$renderer.push(`<!---->All`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div><div class="text-lg font-semibold mt-8 ml-2">ToggleGroup</div> <div class="text-xs font-semibold text-surface-content/50 mb-1 ml-2">full rounded and small</div> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Field($$renderer, {
					label: 'Is Active',
					children: ($$renderer) => {
						ToggleGroup($$renderer, {
							variant: 'outline',
							inset: true,
							rounded: 'full',
							size: 'sm',
							class: 'w-full',
							children: ($$renderer) => {
								ToggleOption($$renderer, {
									value: 'yes',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Yes`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								ToggleOption($$renderer, {
									value: 'no',
									children: ($$renderer) => {
										$$renderer.push(`<!---->No`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								ToggleOption($$renderer, {
									value: 'all',
									children: ($$renderer) => {
										$$renderer.push(`<!---->All`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div><div class="text-lg font-semibold mt-8 ml-2">ToggleGroup</div> <div class="text-xs font-semibold text-surface-content/50 mb-1 ml-2">with icons</div> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Field($$renderer, {
					label: 'Is Active',
					children: ($$renderer) => {
						ToggleGroup($$renderer, {
							variant: 'outline',
							inset: true,
							rounded: 'full',
							children: ($$renderer) => {
								ToggleOption($$renderer, {
									value: 'yes',
									children: ($$renderer) => {
										Icon($$renderer, { data: mdiAccount });
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								ToggleOption($$renderer, {
									value: 'no',
									children: ($$renderer) => {
										Icon($$renderer, { data: mdiAccountOutline });
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								ToggleOption($$renderer, {
									value: 'all',
									children: ($$renderer) => {
										Icon($$renderer, { data: mdiAccountMultipleOutline });
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div> <h2>Button</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Field($$renderer, {
					label: 'Action',
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { id }) => {
							Button($$renderer, {
								id,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Click me`);
								},
								$$slots: { default: true }
							});
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Date input</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Field($$renderer, {
					label: 'Date of Birth',
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { id }) => {
							$$renderer.push(`<input${$.attr('id', id)} type="date" class="text-sm w-full outline-none bg-surface-100"/>`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>input type="number"</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Field($$renderer, {
					label: 'Number',
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { id }) => {
							$$renderer.push(`<input${$.attr('id', id)} type="number"${$.attr('min', 0)}${$.attr('max', 10)}${$.attr('step', 1)} class="w-full outline-none bg-surface-100"/>`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Input</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Field($$renderer, {
					label: 'Phone number',
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { id }) => {
							Input($$renderer, { id, mask: '+1 (___) ___-____', replace: '_' });
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Select</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Field($$renderer, {
					label: 'Position',
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { id }) => {
							$$renderer.push(`<select${$.attr('id', id)} class="text-sm w-full outline-none appearance-none cursor-pointer bg-surface-100">`);

							$$renderer.option({ value: 1 }, ($$renderer) => {
								$$renderer.push(`First`);
							});

							$$renderer.option({ value: 2 }, ($$renderer) => {
								$$renderer.push(`Second`);
							});

							$$renderer.option({ value: 3 }, ($$renderer) => {
								$$renderer.push(`Third`);
							});

							$$renderer.option({ value: 4 }, ($$renderer) => {
								$$renderer.push(`Fourth`);
							});

							$$renderer.push(`</select>`);
						},

						append: ($$renderer) => {
							$$renderer.push(`<span slot="append">`);
							Icon($$renderer, { data: mdiChevronDown });
							$$renderer.push(`<!----></span>`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Label placement</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid gap-4">`);

				Field($$renderer, {
					label: 'Name',
					labelPlacement: 'inset',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Sean Lynch`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Field($$renderer, {
					label: 'Name',
					labelPlacement: 'top',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Sean Lynch`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Field($$renderer, {
					label: 'Name',
					labelPlacement: 'left',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Sean Lynch`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}