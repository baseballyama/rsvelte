import * as $ from 'svelte/internal/server';

import {
	Field,
	RangeField,
	Switch,
	TextField,
	ToggleGroup,
	ToggleOption
} from 'svelte-ux';

import { Text } from 'layerchart';

export default function TextPlaygroundControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			config = {
				x: 0,
				y: 0,
				value: 'This is really long text',
				width: 300,
				textAnchor: 'start',
				verticalAnchor: 'start',
				lineHeight: '1em',
				rotate: 0,
				scaleToFit: false,
				showAnchor: true,
				resizeSvg: true,
				truncate: false,
				truncateOptions: { maxChars: 22, minChars: 0, ellipsis: '…', position: 'end' }
			}
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid gap-2 mb-2 screenshot-hidden">`);

			TextField($$renderer, {
				label: 'value',
				get value() {
					return config.value;
				},

				set value($$value) {
					config.value = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="grid grid-cols-[1fr_1fr_1fr] gap-2">`);

			RangeField($$renderer, {
				label: 'x',
				min: -300,
				max: 300,
				get value() {
					return config.x;
				},

				set value($$value) {
					config.x = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'y',
				min: -300,
				max: 300,
				get value() {
					return config.y;
				},

				set value($$value) {
					config.y = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'width',
				max: 300,
				get value() {
					return config.width;
				},

				set value($$value) {
					config.width = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'rotate',
				max: 720,
				get value() {
					return config.rotate;
				},

				set value($$value) {
					config.rotate = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'textAnchor',
				classes: { input: 'mt-[6px] mb-1' },
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						variant: 'outline',
						size: 'sm',
						inset: true,
						class: 'w-full',
						get value() {
							return config.textAnchor;
						},

						set value($$value) {
							config.textAnchor = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: 'start',
								children: ($$renderer) => {
									$$renderer.push(`<!---->start`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'middle',
								children: ($$renderer) => {
									$$renderer.push(`<!---->middle`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'end',
								children: ($$renderer) => {
									$$renderer.push(`<!---->end`);
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

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'verticalAnchor',
				classes: { input: 'mt-[6px] mb-1' },
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						variant: 'outline',
						size: 'sm',
						inset: true,
						class: 'w-full',
						get value() {
							return config.verticalAnchor;
						},

						set value($$value) {
							config.verticalAnchor = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: 'start',
								children: ($$renderer) => {
									$$renderer.push(`<!---->start`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'middle',
								children: ($$renderer) => {
									$$renderer.push(`<!---->middle`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'end',
								children: ($$renderer) => {
									$$renderer.push(`<!---->end`);
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

			$$renderer.push(`<!----> `);

			TextField($$renderer, {
				label: 'lineHeight',
				get value() {
					return config.lineHeight;
				},

				set value($$value) {
					config.lineHeight = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'scaleToFit',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						Switch($$renderer, {
							id,
							get checked() {
								return config.scaleToFit;
							},

							set checked($$value) {
								config.scaleToFit = $$value;
								$$settled = false;
							}
						});
					}
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'resize svg (container)',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						Switch($$renderer, {
							id,
							get checked() {
								return config.resizeSvg;
							},

							set checked($$value) {
								config.resizeSvg = $$value;
								$$settled = false;
							}
						});
					}
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'showAnchor',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						Switch($$renderer, {
							id,
							get checked() {
								return config.showAnchor;
							},

							set checked($$value) {
								config.showAnchor = $$value;
								$$settled = false;
							}
						});
					}
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'truncate text',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						Switch($$renderer, {
							id,
							get checked() {
								return config.truncate;
							},

							set checked($$value) {
								config.truncate = $$value;
								$$settled = false;
							}
						});
					}
				}
			});

			$$renderer.push(`<!----> <div></div> `);

			if (config.truncate) {
				$$renderer.push('<!--[0-->');

				RangeField($$renderer, {
					label: 'maxChars',
					min: 0,
					max: config.value.length,
					get value() {
						return config.truncateOptions.maxChars;
					},

					set value($$value) {
						config.truncateOptions.maxChars = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Field($$renderer, {
					label: 'position',
					classes: { input: 'mt-[6px] mb-1' },
					children: ($$renderer) => {
						ToggleGroup($$renderer, {
							variant: 'outline',
							size: 'sm',
							inset: true,
							class: 'w-full',
							get value() {
								return config.truncateOptions.position;
							},

							set value($$value) {
								config.truncateOptions.position = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								ToggleOption($$renderer, {
									value: 'start',
									children: ($$renderer) => {
										$$renderer.push(`<!---->start`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								ToggleOption($$renderer, {
									value: 'middle',
									children: ($$renderer) => {
										$$renderer.push(`<!---->middle`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								ToggleOption($$renderer, {
									value: 'end',
									children: ($$renderer) => {
										$$renderer.push(`<!---->end`);
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

				$$renderer.push(`<!----> `);

				TextField($$renderer, {
					label: 'ellipsis',
					get value() {
						return config.truncateOptions.ellipsis;
					},

					set value($$value) {
						config.truncateOptions.ellipsis = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { config });
	});
}