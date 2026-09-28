import * as $ from 'svelte/internal/server';
import { mdiHome, mdiMagnify, mdiMenu, mdiTrashCan } from '@mdi/js';
import { faUser } from '@fortawesome/free-solid-svg-icons';

import {
	Button,
	Field,
	SectionDivider,
	Tooltip,
	Toggle,
	ToggleGroup,
	ToggleOption
} from 'svelte-ux';

import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	let size = 'md';

	const variants = [
		'default',
		'outline',
		'fill',
		'fill-light',
		'fill-outline',
		'text'
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<h1>Examples</h1> <h2>Basic</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Click me`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Link</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					href: 'https://www.google.com',
					target: '_blank',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Open Google`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Disabled</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					disabled: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Click me`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Loading</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					loading: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Loading...`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'outline',
					color: 'primary',
					loading: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Loading...`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'fill',
					color: 'primary',
					loading: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Loading...`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'fill-light',
					color: 'primary',
					loading: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Loading...`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'fill-outline',
					color: 'primary',
					loading: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Loading...`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'text',
					color: 'primary',
					loading: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Loading...`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-2">`);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: loading, toggle }) => {
							Button($$renderer, {
								loading,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Click me`);
								},
								$$slots: { default: true }
							});
						}
					}
				});

				$$renderer.push(`<!----> `);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: loading, toggle }) => {
							Button($$renderer, {
								variant: 'outline',
								color: 'primary',
								loading,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Click me`);
								},
								$$slots: { default: true }
							});
						}
					}
				});

				$$renderer.push(`<!----> `);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: loading, toggle }) => {
							Button($$renderer, {
								variant: 'fill',
								color: 'primary',
								loading,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Click me`);
								},
								$$slots: { default: true }
							});
						}
					}
				});

				$$renderer.push(`<!----> `);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: loading, toggle }) => {
							Button($$renderer, {
								variant: 'fill-light',
								color: 'primary',
								loading,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Click me`);
								},
								$$slots: { default: true }
							});
						}
					}
				});

				$$renderer.push(`<!----> `);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: loading, toggle }) => {
							Button($$renderer, {
								variant: 'fill-outline',
								color: 'primary',
								loading,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Click me`);
								},
								$$slots: { default: true }
							});
						}
					}
				});

				$$renderer.push(`<!----> `);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: loading, toggle }) => {
							Button($$renderer, {
								variant: 'text',
								color: 'primary',
								loading,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Click me`);
								},
								$$slots: { default: true }
							});
						}
					}
				});

				$$renderer.push(`<!----></div> <div class="mt-2">`);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: loading, toggle }) => {
							Button($$renderer, {
								icon: faUser,
								loading,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Click me`);
								},
								$$slots: { default: true }
							});
						}
					}
				});

				$$renderer.push(`<!----> `);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: loading, toggle }) => {
							Button($$renderer, {
								icon: faUser,
								variant: 'outline',
								color: 'primary',
								loading,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Click me`);
								},
								$$slots: { default: true }
							});
						}
					}
				});

				$$renderer.push(`<!----> `);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: loading, toggle }) => {
							Button($$renderer, {
								icon: faUser,
								variant: 'fill',
								color: 'primary',
								loading,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Click me`);
								},
								$$slots: { default: true }
							});
						}
					}
				});

				$$renderer.push(`<!----> `);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: loading, toggle }) => {
							Button($$renderer, {
								icon: faUser,
								variant: 'fill-light',
								color: 'primary',
								loading,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Click me`);
								},
								$$slots: { default: true }
							});
						}
					}
				});

				$$renderer.push(`<!----> `);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: loading, toggle }) => {
							Button($$renderer, {
								icon: faUser,
								variant: 'fill-outline',
								color: 'primary',
								loading,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Click me`);
								},
								$$slots: { default: true }
							});
						}
					}
				});

				$$renderer.push(`<!----> `);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: loading, toggle }) => {
							Button($$renderer, {
								icon: faUser,
								variant: 'text',
								color: 'primary',
								loading,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Click me`);
								},
								$$slots: { default: true }
							});
						}
					}
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="grid grid-cols-[1fr,auto] gap-2 items-end"><h2>Variants, Color &amp; Size</h2> `);

		Field($$renderer, {
			label: 'size: ',
			labelPlacement: 'left',
			class: 'mb-1',
			children: ($$renderer) => {
				ToggleGroup($$renderer, {
					size: 'sm',
					get value() {
						return size;
					},

					set value($$value) {
						size = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						ToggleOption($$renderer, {
							value: 'sm',
							children: ($$renderer) => {
								$$renderer.push(`<!---->sm`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 'md',
							children: ($$renderer) => {
								$$renderer.push(`<!---->md`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 'lg',
							children: ($$renderer) => {
								$$renderer.push(`<!---->lg`);
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

		$$renderer.push(`<!----></div> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid gap-3 divide-y"><!--[-->`);

				const each_array = $.ensure_array_like(variants);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let variant = each_array[$$index];

					$$renderer.push(`<div><div class="font-semibold my-2">${$.escape(variant)}</div> <div class="grid gap-2 ml-4"><div>`);

					Button($$renderer, {
						variant,
						size,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Default`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant,
						size,
						color: 'primary',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Primary`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant,
						size,
						color: 'secondary',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Secondary`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant,
						size,
						color: 'accent',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Accent`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant,
						size,
						color: 'neutral',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Neutral`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div> <div>`);

					Button($$renderer, {
						variant,
						size,
						color: 'info',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Info`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant,
						size,
						color: 'success',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Success`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant,
						size,
						color: 'warning',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Warning`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant,
						size,
						color: 'danger',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Danger`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div> <div></div></div></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>\`none\` variant</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					variant: 'none',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Click me`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Rounded</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid gap-2"><div>`);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->default`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					rounded: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->rounded`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					rounded: 'full',
					children: ($$renderer) => {
						$$renderer.push(`<!---->full`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					rounded: false,
					children: ($$renderer) => {
						$$renderer.push(`<!---->false`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div>`);

				Button($$renderer, {
					variant: 'outline',
					color: 'primary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->default`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'outline',
					color: 'primary',
					rounded: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->rounded`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'outline',
					color: 'primary',
					rounded: 'full',
					children: ($$renderer) => {
						$$renderer.push(`<!---->full`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'outline',
					color: 'primary',
					rounded: false,
					children: ($$renderer) => {
						$$renderer.push(`<!---->false`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div>`);

				Button($$renderer, {
					variant: 'fill',
					color: 'primary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->default`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'fill',
					color: 'primary',
					rounded: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->rounded`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'fill',
					color: 'primary',
					rounded: 'full',
					children: ($$renderer) => {
						$$renderer.push(`<!---->full`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'fill',
					color: 'primary',
					rounded: false,
					children: ($$renderer) => {
						$$renderer.push(`<!---->false`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div>`);

				Button($$renderer, {
					variant: 'fill-light',
					color: 'primary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->default`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'fill-light',
					color: 'primary',
					rounded: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->rounded`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'fill-light',
					color: 'primary',
					rounded: 'full',
					children: ($$renderer) => {
						$$renderer.push(`<!---->full`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'fill-light',
					color: 'primary',
					rounded: false,
					children: ($$renderer) => {
						$$renderer.push(`<!---->false`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div>`);

				Button($$renderer, {
					variant: 'fill-outline',
					color: 'primary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->default`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'fill-outline',
					color: 'primary',
					rounded: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->rounded`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'fill-outline',
					color: 'primary',
					rounded: 'full',
					children: ($$renderer) => {
						$$renderer.push(`<!---->full`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'fill-outline',
					color: 'primary',
					rounded: false,
					children: ($$renderer) => {
						$$renderer.push(`<!---->false`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Uppercase</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					class: 'uppercase',
					children: ($$renderer) => {
						$$renderer.push(`<!---->default`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					class: 'uppercase',
					variant: 'outline',
					color: 'primary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->outline`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					class: 'uppercase',
					variant: 'fill',
					color: 'primary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->fill`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					class: 'uppercase',
					variant: 'fill-light',
					color: 'primary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->fill-light`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					class: 'uppercase',
					variant: 'fill-outline',
					color: 'primary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->fill-outline`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					class: 'uppercase',
					variant: 'text',
					color: 'primary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->text`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Tooltip</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Tooltip($$renderer, {
					title: 'Really, do it!',
					placement: 'right',
					offset: 2,
					children: ($$renderer) => {
						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Click me`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Tooltip (disabled)</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Tooltip($$renderer, {
					title: 'Really, do it!',
					placement: 'right',
					offset: 2,
					children: ($$renderer) => {
						Button($$renderer, {
							disabled: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Click me`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Text with icon</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex items-center">`);

				Button($$renderer, {
					icon: mdiTrashCan,
					color: 'danger',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Delete`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					icon: mdiMagnify,
					class: 'flex-row-reverse',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Search`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					icon: mdiHome,
					class: 'flex-col',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Home`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					icon: mdiHome,
					class: 'flex-col-reverse',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Home`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					icon: faUser,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Profile`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Pass props to Icon</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					icon: { data: mdiTrashCan, size: '2rem', style: 'color: crimson' },
					color: 'danger',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Delete`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Pass class to Icon</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					icon: mdiTrashCan,
					classes: { icon: 'text-danger-300 text-lg' },
					color: 'danger',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Delete`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		SectionDivider($$renderer, {
			class: 'mt-12',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Icon only`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Icon-only button</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, { icon: mdiMenu });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Icon-only size</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, { icon: mdiMenu, size: 'sm' });
				$$renderer.push(`<!----> `);
				Button($$renderer, { icon: mdiMenu, size: 'md' });
				$$renderer.push(`<!----> `);
				Button($$renderer, { icon: mdiMenu, size: 'lg' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Icon-only button with custom padding</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, { icon: mdiMenu, class: 'p-2' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Icon via url</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					icon: 'https://api.iconify.design/mdi:account.svg',
					class: 'p-2'
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Icon via SVG string</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					icon: '<svg width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4Z"/></svg>',
					class: 'p-2'
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Icon-only button variants and color</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div>`);
				Button($$renderer, { icon: mdiMenu });
				$$renderer.push(`<!----> `);
				Button($$renderer, { icon: mdiMenu, color: 'primary' });
				$$renderer.push(`<!----></div> <div>`);
				Button($$renderer, { icon: mdiMenu, variant: 'outline' });
				$$renderer.push(`<!----> `);
				Button($$renderer, { icon: mdiMenu, variant: 'outline', color: 'primary' });
				$$renderer.push(`<!----></div> <div>`);
				Button($$renderer, { icon: mdiMenu, variant: 'fill' });
				$$renderer.push(`<!----> `);
				Button($$renderer, { icon: mdiMenu, variant: 'fill', color: 'primary' });
				$$renderer.push(`<!----></div> <div>`);
				Button($$renderer, { icon: mdiMenu, variant: 'fill-light' });
				$$renderer.push(`<!----> `);
				Button($$renderer, { icon: mdiMenu, variant: 'fill-light', color: 'primary' });
				$$renderer.push(`<!----></div> <div>`);
				Button($$renderer, { icon: mdiMenu, variant: 'fill-outline' });
				$$renderer.push(`<!----> `);
				Button($$renderer, { icon: mdiMenu, variant: 'fill-outline', color: 'primary' });
				$$renderer.push(`<!----></div> <div>`);
				Button($$renderer, { icon: mdiMenu, variant: 'text' });
				$$renderer.push(`<!----> `);
				Button($$renderer, { icon: mdiMenu, variant: 'text', color: 'primary' });
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