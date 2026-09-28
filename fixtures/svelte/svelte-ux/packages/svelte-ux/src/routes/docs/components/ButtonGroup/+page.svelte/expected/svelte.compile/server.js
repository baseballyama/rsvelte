import * as $ from 'svelte/internal/server';

import {
	mdiChevronDown,
	mdiFormatAlignLeft,
	mdiFormatAlignCenter,
	mdiFormatAlignRight,
	mdiBookmark
} from '@mdi/js';

import { Button, ButtonGroup, Menu, MenuItem, Toggle, Tooltip } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Examples</h1> <h2>Basic</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid gap-2">`);

			ButtonGroup($$renderer, {
				color: 'primary',
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Left`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Center`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Right`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'outline',
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Left`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Center`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Right`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill',
				color: 'primary',
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Left`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Center`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Right`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill-light',
				color: 'primary',
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Left`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Center`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Right`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill-outline',
				color: 'primary',
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Left`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Center`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Right`);
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

	$$renderer.push(`<!----> <h2>Icons</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid gap-2">`);

			ButtonGroup($$renderer, {
				color: 'primary',
				children: ($$renderer) => {
					Button($$renderer, { icon: mdiFormatAlignLeft });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignCenter });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignRight });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'outline',
				children: ($$renderer) => {
					Button($$renderer, { icon: mdiFormatAlignLeft });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignCenter });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignRight });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill',
				color: 'primary',
				children: ($$renderer) => {
					Button($$renderer, { icon: mdiFormatAlignLeft });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignCenter });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignRight });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill-light',
				color: 'primary',
				children: ($$renderer) => {
					Button($$renderer, { icon: mdiFormatAlignLeft });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignCenter });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignRight });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill-outline',
				color: 'primary',
				children: ($$renderer) => {
					Button($$renderer, { icon: mdiFormatAlignLeft });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignCenter });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignRight });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Icons (partially rounded)</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid gap-2">`);

			ButtonGroup($$renderer, {
				color: 'primary',
				children: ($$renderer) => {
					Button($$renderer, { icon: mdiFormatAlignLeft, iconOnly: false });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignCenter, iconOnly: false });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignRight, iconOnly: false });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'outline',
				children: ($$renderer) => {
					Button($$renderer, { icon: mdiFormatAlignLeft, iconOnly: false });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignCenter, iconOnly: false });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignRight, iconOnly: false });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill',
				color: 'primary',
				children: ($$renderer) => {
					Button($$renderer, { icon: mdiFormatAlignLeft, iconOnly: false });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignCenter, iconOnly: false });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignRight, iconOnly: false });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill-light',
				color: 'primary',
				children: ($$renderer) => {
					Button($$renderer, { icon: mdiFormatAlignLeft, iconOnly: false });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignCenter, iconOnly: false });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignRight, iconOnly: false });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill-outline',
				color: 'primary',
				children: ($$renderer) => {
					Button($$renderer, { icon: mdiFormatAlignLeft, iconOnly: false });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignCenter, iconOnly: false });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignRight, iconOnly: false });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Selected</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid gap-2">`);

			ButtonGroup($$renderer, {
				color: 'primary',
				children: ($$renderer) => {
					Button($$renderer, {
						icon: mdiFormatAlignLeft,
						iconOnly: false,
						variant: 'fill-light'
					});

					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignCenter, iconOnly: false });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignRight, iconOnly: false });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'outline',
				children: ($$renderer) => {
					Button($$renderer, { icon: mdiFormatAlignLeft, iconOnly: false });
					$$renderer.push(`<!----> `);

					Button($$renderer, {
						icon: mdiFormatAlignCenter,
						iconOnly: false,
						variant: 'fill-outline',
						color: 'primary',
						class: 'z-10'
					});

					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignRight, iconOnly: false });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill',
				color: 'primary',
				children: ($$renderer) => {
					Button($$renderer, { icon: mdiFormatAlignLeft, iconOnly: false });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignCenter, iconOnly: false });
					$$renderer.push(`<!----> `);

					Button($$renderer, {
						icon: mdiFormatAlignRight,
						iconOnly: false,
						class: 'bg-primary-700 hover:bg-primary-900'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill-light',
				color: 'primary',
				children: ($$renderer) => {
					Button($$renderer, { icon: mdiFormatAlignLeft, iconOnly: false });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignCenter, iconOnly: false, variant: 'fill' });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignRight, iconOnly: false });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill-outline',
				color: 'primary',
				children: ($$renderer) => {
					Button($$renderer, { icon: mdiFormatAlignLeft, iconOnly: false, variant: 'fill' });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignCenter, iconOnly: false });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignRight, iconOnly: false });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Size</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid gap-2">`);

			ButtonGroup($$renderer, {
				size: 'sm',
				color: 'primary',
				children: ($$renderer) => {
					Button($$renderer, {
						icon: mdiBookmark,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Bookmark`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->12k`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'outline',
				size: 'sm',
				children: ($$renderer) => {
					Button($$renderer, {
						icon: mdiBookmark,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Bookmark`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->12k`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill',
				size: 'sm',
				color: 'primary',
				children: ($$renderer) => {
					Button($$renderer, {
						icon: mdiBookmark,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Bookmark`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->12k`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill-light',
				size: 'sm',
				color: 'primary',
				children: ($$renderer) => {
					Button($$renderer, {
						icon: mdiBookmark,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Bookmark`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->12k`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill-outline',
				size: 'sm',
				color: 'primary',
				children: ($$renderer) => {
					Button($$renderer, {
						icon: mdiBookmark,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Bookmark`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->12k`);
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

	$$renderer.push(`<!----> <h2>Disabled</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid gap-2">`);

			ButtonGroup($$renderer, {
				color: 'primary',
				disabled: true,
				children: ($$renderer) => {
					Button($$renderer, { icon: mdiFormatAlignLeft, iconOnly: false });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignCenter, iconOnly: false });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignRight, iconOnly: false });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'outline',
				disabled: true,
				children: ($$renderer) => {
					Button($$renderer, { icon: mdiFormatAlignLeft, iconOnly: false });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignCenter, iconOnly: false });
					$$renderer.push(`<!----> `);
					Button($$renderer, { icon: mdiFormatAlignRight, iconOnly: false });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill',
				disabled: true,
				children: ($$renderer) => {
					Button($$renderer, { color: 'primary', icon: mdiFormatAlignLeft, iconOnly: false });
					$$renderer.push(`<!----> `);

					Button($$renderer, {
						color: 'primary',
						icon: mdiFormatAlignCenter,
						iconOnly: false
					});

					$$renderer.push(`<!----> `);
					Button($$renderer, { color: 'primary', icon: mdiFormatAlignRight, iconOnly: false });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill-light',
				disabled: true,
				children: ($$renderer) => {
					Button($$renderer, { color: 'primary', icon: mdiFormatAlignLeft, iconOnly: false });
					$$renderer.push(`<!----> `);

					Button($$renderer, {
						color: 'primary',
						icon: mdiFormatAlignCenter,
						iconOnly: false
					});

					$$renderer.push(`<!----> `);
					Button($$renderer, { color: 'primary', icon: mdiFormatAlignRight, iconOnly: false });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill-outline',
				disabled: true,
				children: ($$renderer) => {
					Button($$renderer, { color: 'primary', icon: mdiFormatAlignLeft, iconOnly: false });
					$$renderer.push(`<!----> `);

					Button($$renderer, {
						color: 'primary',
						icon: mdiFormatAlignCenter,
						iconOnly: false
					});

					$$renderer.push(`<!----> `);
					Button($$renderer, { color: 'primary', icon: mdiFormatAlignRight, iconOnly: false });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>with Menu</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid gap-2">`);

			ButtonGroup($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Click me`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Toggle($$renderer, {
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$renderer, { on: open, toggle, toggleOff }) => {
								$$renderer.push(`<span>`);
								Button($$renderer, { icon: mdiChevronDown, rounded: true, class: 'px-1' });
								$$renderer.push(`<!----> `);

								Menu($$renderer, {
									open,
									placement: 'bottom-start',
									children: ($$renderer) => {
										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Hello`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Hello`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Hello`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Hello`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></span>`);
							}
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'outline',
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Click me`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Toggle($$renderer, {
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$renderer, { on: open, toggle, toggleOff }) => {
								$$renderer.push(`<span>`);
								Button($$renderer, { icon: mdiChevronDown, rounded: true, class: 'px-1' });
								$$renderer.push(`<!----> `);

								Menu($$renderer, {
									open,
									placement: 'bottom-start',
									children: ($$renderer) => {
										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Hello`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Hello`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Hello`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Hello`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></span>`);
							}
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill',
				color: 'primary',
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Click me`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Toggle($$renderer, {
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$renderer, { on: open, toggle, toggleOff }) => {
								$$renderer.push(`<span>`);
								Button($$renderer, { icon: mdiChevronDown, rounded: true, class: 'px-1' });
								$$renderer.push(`<!----> `);

								Menu($$renderer, {
									open,
									placement: 'bottom-start',
									children: ($$renderer) => {
										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Hello`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Hello`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Hello`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Hello`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></span>`);
							}
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill-light',
				color: 'primary',
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Click me`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Toggle($$renderer, {
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$renderer, { on: open, toggle, toggleOff }) => {
								$$renderer.push(`<span>`);
								Button($$renderer, { icon: mdiChevronDown, rounded: true, class: 'px-1' });
								$$renderer.push(`<!----> `);

								Menu($$renderer, {
									open,
									placement: 'bottom-start',
									children: ($$renderer) => {
										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Hello`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Hello`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Hello`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Hello`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></span>`);
							}
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill-outline',
				color: 'primary',
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Click me`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Toggle($$renderer, {
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$renderer, { on: open, toggle, toggleOff }) => {
								$$renderer.push(`<span>`);
								Button($$renderer, { icon: mdiChevronDown, rounded: true, class: 'px-1' });
								$$renderer.push(`<!----> `);

								Menu($$renderer, {
									open,
									placement: 'bottom-start',
									children: ($$renderer) => {
										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Hello`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Hello`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Hello`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Hello`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></span>`);
							}
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>with Tooltip</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid gap-2">`);

			ButtonGroup($$renderer, {
				color: 'primary',
				children: ($$renderer) => {
					Tooltip($$renderer, {
						title: 'left',
						offset: 2,
						children: ($$renderer) => {
							Button($$renderer, { icon: mdiFormatAlignLeft });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						title: 'center',
						offset: 2,
						children: ($$renderer) => {
							Button($$renderer, { icon: mdiFormatAlignCenter });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						title: 'right',
						offset: 2,
						children: ($$renderer) => {
							Button($$renderer, { icon: mdiFormatAlignRight });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'outline',
				children: ($$renderer) => {
					Tooltip($$renderer, {
						title: 'left',
						offset: 2,
						children: ($$renderer) => {
							Button($$renderer, { icon: mdiFormatAlignLeft });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						title: 'center',
						offset: 2,
						children: ($$renderer) => {
							Button($$renderer, { icon: mdiFormatAlignCenter });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						title: 'right',
						offset: 2,
						children: ($$renderer) => {
							Button($$renderer, { icon: mdiFormatAlignRight });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill',
				color: 'primary',
				children: ($$renderer) => {
					Tooltip($$renderer, {
						title: 'left',
						offset: 2,
						children: ($$renderer) => {
							Button($$renderer, { icon: mdiFormatAlignLeft });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						title: 'center',
						offset: 2,
						children: ($$renderer) => {
							Button($$renderer, { icon: mdiFormatAlignCenter });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						title: 'right',
						offset: 2,
						children: ($$renderer) => {
							Button($$renderer, { icon: mdiFormatAlignRight });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill-light',
				color: 'primary',
				children: ($$renderer) => {
					Tooltip($$renderer, {
						title: 'left',
						offset: 2,
						children: ($$renderer) => {
							Button($$renderer, { icon: mdiFormatAlignLeft });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						title: 'center',
						offset: 2,
						children: ($$renderer) => {
							Button($$renderer, { icon: mdiFormatAlignCenter });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						title: 'right',
						offset: 2,
						children: ($$renderer) => {
							Button($$renderer, { icon: mdiFormatAlignRight });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill-outline',
				color: 'primary',
				children: ($$renderer) => {
					Tooltip($$renderer, {
						title: 'left',
						offset: 2,
						children: ($$renderer) => {
							Button($$renderer, { icon: mdiFormatAlignLeft });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						title: 'center',
						offset: 2,
						children: ($$renderer) => {
							Button($$renderer, { icon: mdiFormatAlignCenter });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						title: 'right',
						offset: 2,
						children: ($$renderer) => {
							Button($$renderer, { icon: mdiFormatAlignRight });
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