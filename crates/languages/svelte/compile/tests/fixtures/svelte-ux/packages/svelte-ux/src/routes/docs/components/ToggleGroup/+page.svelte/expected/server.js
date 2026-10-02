import * as $ from 'svelte/internal/server';

import {
	ApiDocs,
	Button,
	Field,
	Radio,
	ToggleGroup,
	ToggleOption,
	TogglePanel
} from 'svelte-ux';

import Preview from '$lib/components/Preview.svelte';
import toggleGroupApi from '$lib/components/ToggleGroup.svelte?raw&sveld';
import toggleOptionApi from '$lib/components/ToggleOption.svelte?raw&sveld';

export default function _page($$renderer) {
	const allValue = {};
	const missedValue = {};
	const callsValue = {};
	let selected = 1;
	let selectedStr = 'all';
	let selectedObj = missedValue;
	let variant = 'default';
	let size = 'md';
	let rounded = true;
	let inset = false;
	let gap = false;
	let vertical = false;
	let showPanes = false;

	const variants = [
		'default',
		'outline',
		'fill',
		'fill-light',
		'fill-surface',
		'underline'
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<h1>Playground</h1> <div class="grid gap-2"><div>`);

		Preview($$renderer, {
			children: ($$renderer) => {
				ToggleGroup($$renderer, {
					variant,
					size,
					rounded,
					gap,
					inset,
					vertical,
					children: ($$renderer) => {
						ToggleOption($$renderer, {
							value: 'all',
							children: ($$renderer) => {
								$$renderer.push(`<!---->All`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 'missed',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Missed`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 'calls',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Calls`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},

					$$slots: {
						default: true,
						panes: ($$renderer) => {
							{
								if (showPanes) {
									$$renderer.push(`<!--[0--><div class="mt-2 p-4 bg-surface-content/5 rounded border">`);

									TogglePanel($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->All panel`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									TogglePanel($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Missed panel`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									TogglePanel($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Calls panel`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							}
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		Field($$renderer, {
			label: 'Variant',
			classes: { input: 'flex flex-wrap gap-3' },
			children: ($$renderer) => {
				Radio($$renderer, {
					name: 'variant',
					value: 'default',
					get group() {
						return variant;
					},

					set group($$value) {
						variant = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->default`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'variant',
					value: 'outline',
					get group() {
						return variant;
					},

					set group($$value) {
						variant = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->outline`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'variant',
					value: 'fill',
					get group() {
						return variant;
					},

					set group($$value) {
						variant = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->fill`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'variant',
					value: 'fill-light',
					get group() {
						return variant;
					},

					set group($$value) {
						variant = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->fill-light`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'variant',
					value: 'fill-surface',
					get group() {
						return variant;
					},

					set group($$value) {
						variant = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->fill-surface`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'variant',
					value: 'underline',
					get group() {
						return variant;
					},

					set group($$value) {
						variant = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->underline`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="grid md:grid-cols-3 gap-2">`);

		Field($$renderer, {
			label: 'Size',
			classes: { container: 'h-full', input: 'flex gap-3 md:grid md:gap-1' },
			children: ($$renderer) => {
				Radio($$renderer, {
					name: 'size',
					value: 'xs',
					get group() {
						return size;
					},

					set group($$value) {
						size = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->xs`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'size',
					value: 'sm',
					get group() {
						return size;
					},

					set group($$value) {
						size = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->sm`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'size',
					value: 'md',
					get group() {
						return size;
					},

					set group($$value) {
						size = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->md`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'size',
					value: 'lg',
					get group() {
						return size;
					},

					set group($$value) {
						size = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->lg`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Rounded',
			classes: { container: 'h-full', input: 'flex gap-3 md:grid md:gap-1' },
			children: ($$renderer) => {
				Radio($$renderer, {
					name: 'rounded',
					value: false,
					get group() {
						return rounded;
					},

					set group($$value) {
						rounded = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->false`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'rounded',
					value: true,
					get group() {
						return rounded;
					},

					set group($$value) {
						rounded = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->true`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'rounded',
					value: 'full',
					get group() {
						return rounded;
					},

					set group($$value) {
						rounded = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->full`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Gap',
			classes: { container: 'h-full', input: 'flex gap-3 md:grid md:gap-1' },
			children: ($$renderer) => {
				Radio($$renderer, {
					name: 'gap',
					value: false,
					get group() {
						return gap;
					},

					set group($$value) {
						gap = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->false`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'gap',
					value: true,
					get group() {
						return gap;
					},

					set group($$value) {
						gap = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->true`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'gap',
					value: 'px',
					get group() {
						return gap;
					},

					set group($$value) {
						gap = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->px`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Inset',
			classes: { input: 'flex gap-3 md:grid md:gap-1' },
			children: ($$renderer) => {
				Radio($$renderer, {
					name: 'inset',
					value: false,
					get group() {
						return inset;
					},

					set group($$value) {
						inset = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->false`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'inset',
					value: true,
					get group() {
						return inset;
					},

					set group($$value) {
						inset = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->true`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Vertical',
			classes: { input: 'flex gap-3 md:grid md:gap-1' },
			children: ($$renderer) => {
				Radio($$renderer, {
					name: 'vertical',
					value: false,
					get group() {
						return vertical;
					},

					set group($$value) {
						vertical = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->false`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'vertical',
					value: true,
					get group() {
						return vertical;
					},

					set group($$value) {
						vertical = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->true`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Show panes',
			classes: { input: 'flex gap-3 md:grid md:gap-1' },
			children: ($$renderer) => {
				Radio($$renderer, {
					name: 'panes',
					value: false,
					get group() {
						return showPanes;
					},

					set group($$value) {
						showPanes = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->false`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					name: 'panes',
					value: true,
					get group() {
						return showPanes;
					},

					set group($$value) {
						showPanes = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->true`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div> <h1>Examples</h1> <h2>Variants</h2> <!--[-->`);

		const each_array = $.ensure_array_like(variants);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let variant = each_array[$$index];

			$$renderer.push(`<h3>${$.escape(variant)}</h3> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="inline-grid gap-2">`);

					ToggleGroup($$renderer, {
						variant,
						get value() {
							return selectedStr;
						},

						set value($$value) {
							selectedStr = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: 'all',
								children: ($$renderer) => {
									$$renderer.push(`<!---->All`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'missed',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Missed`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'calls',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Calls`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ToggleGroup($$renderer, {
						variant,
						rounded: false,
						get value() {
							return selectedStr;
						},

						set value($$value) {
							selectedStr = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: 'all',
								children: ($$renderer) => {
									$$renderer.push(`<!---->All`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'missed',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Missed`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'calls',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Calls`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ToggleGroup($$renderer, {
						variant,
						rounded: 'full',
						get value() {
							return selectedStr;
						},

						set value($$value) {
							selectedStr = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: 'all',
								children: ($$renderer) => {
									$$renderer.push(`<!---->All`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'missed',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Missed`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'calls',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Calls`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ToggleGroup($$renderer, {
						variant,
						rounded: 'full',
						inset: true,
						get value() {
							return selectedStr;
						},

						set value($$value) {
							selectedStr = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: 'all',
								children: ($$renderer) => {
									$$renderer.push(`<!---->All`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'missed',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Missed`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'calls',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Calls`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ToggleGroup($$renderer, {
						variant,
						gap: true,
						get value() {
							return selectedStr;
						},

						set value($$value) {
							selectedStr = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: 'all',
								children: ($$renderer) => {
									$$renderer.push(`<!---->All`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'missed',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Missed`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'calls',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Calls`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ToggleGroup($$renderer, {
						variant,
						gap: 'px',
						get value() {
							return selectedStr;
						},

						set value($$value) {
							selectedStr = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: 'all',
								children: ($$renderer) => {
									$$renderer.push(`<!---->All`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'missed',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Missed`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'calls',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Calls`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!--]--> <h2>Vertical layout</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				ToggleGroup($$renderer, {
					vertical: true,
					children: ($$renderer) => {
						ToggleOption($$renderer, {
							value: 'all',
							children: ($$renderer) => {
								$$renderer.push(`<!---->All`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 'missed',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Missed`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 'calls',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Calls`);
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

		$$renderer.push(`<!----> <h2>Vertical with fixed width</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				ToggleGroup($$renderer, {
					class: 'w-[300px]',
					vertical: true,
					children: ($$renderer) => {
						ToggleOption($$renderer, {
							value: 'all',
							children: ($$renderer) => {
								$$renderer.push(`<!---->All`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 'missed',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Missed`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 'calls',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Calls`);
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

		$$renderer.push(`<!----> <h2>Left aligned tabs with fixed height</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				ToggleGroup($$renderer, {
					variant: 'underline',
					classes: { options: 'justify-start h-10' },
					children: ($$renderer) => {
						ToggleOption($$renderer, {
							value: 'all',
							children: ($$renderer) => {
								$$renderer.push(`<!---->All`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 'missed',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Missed`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 'calls',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Calls`);
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

		$$renderer.push(`<!----> <h2>Grid layout</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				ToggleGroup($$renderer, {
					classes: { options: 'grid-rows-3 grid-cols-3' },
					children: ($$renderer) => {
						ToggleOption($$renderer, {
							value: 1,
							children: ($$renderer) => {
								$$renderer.push(`<!---->1`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 2,
							children: ($$renderer) => {
								$$renderer.push(`<!---->2`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 3,
							children: ($$renderer) => {
								$$renderer.push(`<!---->3`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 4,
							children: ($$renderer) => {
								$$renderer.push(`<!---->4`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 5,
							children: ($$renderer) => {
								$$renderer.push(`<!---->5`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 6,
							children: ($$renderer) => {
								$$renderer.push(`<!---->6`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 7,
							children: ($$renderer) => {
								$$renderer.push(`<!---->7`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 8,
							children: ($$renderer) => {
								$$renderer.push(`<!---->8`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 9,
							children: ($$renderer) => {
								$$renderer.push(`<!---->9`);
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

		$$renderer.push(`<!----> <h2>Circle</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				ToggleGroup($$renderer, {
					rounded: 'full',
					classes: { options: 'inline-grid' },
					children: ($$renderer) => {
						ToggleOption($$renderer, {
							value: 1,
							class: 'h-10 aspect-square',
							children: ($$renderer) => {
								$$renderer.push(`<!---->1`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 2,
							class: 'h-10 aspect-square',
							children: ($$renderer) => {
								$$renderer.push(`<!---->2`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 3,
							class: 'h-10 aspect-square',
							children: ($$renderer) => {
								$$renderer.push(`<!---->3`);
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

		$$renderer.push(`<!----> <h2>Controlled</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				ToggleGroup($$renderer, {
					get value() {
						return selectedStr;
					},

					set value($$value) {
						selectedStr = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						ToggleOption($$renderer, {
							value: 'all',
							children: ($$renderer) => {
								$$renderer.push(`<!---->All`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 'missed',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Missed`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 'calls',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Calls`);
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

		$$renderer.push(`<!----> <div class="mt-4">Select: `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->All`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Missed`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Calls`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Clear`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <h2>Controlled with null option</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				ToggleGroup($$renderer, {
					get value() {
						return selectedStr;
					},

					set value($$value) {
						selectedStr = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						ToggleOption($$renderer, {
							value: null,
							children: ($$renderer) => {
								$$renderer.push(`<!---->None`);
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

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 'missed',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Missed`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 'calls',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Calls`);
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

		$$renderer.push(`<!----> <div class="mt-4">Select: `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->None`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->All`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Missed`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Calls`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <h2>Controlled with undefined option</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				ToggleGroup($$renderer, {
					get value() {
						return selectedStr;
					},

					set value($$value) {
						selectedStr = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						ToggleOption($$renderer, {
							value: undefined,
							children: ($$renderer) => {
								$$renderer.push(`<!---->None`);
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

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 'missed',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Missed`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 'calls',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Calls`);
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

		$$renderer.push(`<!----> <div class="mt-4">Select: `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->None`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->All`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Missed`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Calls`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <h2>Controlled (object value)</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				ToggleGroup($$renderer, {
					get value() {
						return selectedObj;
					},

					set value($$value) {
						selectedObj = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						ToggleOption($$renderer, {
							value: allValue,
							children: ($$renderer) => {
								$$renderer.push(`<!---->All`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: missedValue,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Missed`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: callsValue,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Calls`);
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

		$$renderer.push(`<!----> <div class="mt-4">Select: `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->All`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Missed`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Calls`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Clear`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <h2>Overflow scrollIntoView</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				ToggleGroup($$renderer, {
					value: selected,
					classes: { options: 'w-full overflow-auto scrollbar-none' },
					autoscroll: true,
					children: ($$renderer) => {
						ToggleOption($$renderer, {
							value: 1,
							class: 'w-32',
							children: ($$renderer) => {
								$$renderer.push(`<!---->One`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 2,
							class: 'w-32',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Two`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 3,
							class: 'w-32',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Three`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 4,
							class: 'w-32',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Four`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 5,
							class: 'w-32',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Five`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 6,
							class: 'w-32',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Six`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 7,
							class: 'w-32',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Seven`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 8,
							class: 'w-32',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Eight`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 9,
							class: 'w-32',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Nine`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 10,
							class: 'w-32',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Ten`);
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

		$$renderer.push(`<!----> <div class="mt-4">Select: `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->1`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->2`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->3`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->4`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->5`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->6`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->7`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->8`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->9`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->10`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <h1>ToggleGroup API</h1> `);
		ApiDocs($$renderer, { api: toggleGroupApi });
		$$renderer.push(`<!----> <h1>ToggleOption API</h1> `);
		ApiDocs($$renderer, { api: toggleOptionApi });
		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}