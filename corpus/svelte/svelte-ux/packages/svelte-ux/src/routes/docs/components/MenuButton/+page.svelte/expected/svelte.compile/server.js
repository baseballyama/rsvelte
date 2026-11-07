import * as $ from 'svelte/internal/server';

import {
	mdiContentCopy,
	mdiContentCut,
	mdiContentPaste,
	mdiMagnify,
	mdiChevronDown
} from '@mdi/js';

import { Icon, MenuButton, MenuItem, TextField } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	const options = [
		{ label: 'Cut', value: 'cut' },
		{ label: 'Copy', value: 'copy' },
		{ label: 'Paste', value: 'paste' }
	];

	const optionsWithIcons = [
		{ label: 'Cut', value: 'cut', icon: mdiContentCut },
		{ label: 'Copy', value: 'copy', icon: mdiContentCopy },
		{ label: 'Paste', value: 'paste', icon: mdiContentPaste }
	];

	$$renderer.push(`<h1>Examples</h1> <h2>Basic</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuButton($$renderer, { options });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Label</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuButton($$renderer, { label: 'View', options });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Value</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuButton($$renderer, { options, value: 'copy' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Icon</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuButton($$renderer, { options, icon: mdiMagnify });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Option icons</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuButton($$renderer, { options: optionsWithIcons });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Option icons with selected icon</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuButton($$renderer, {
				options: optionsWithIcons,
				$$slots: {
					selection: ($$renderer, { value }) => {
						{
							if (value) {
								$$renderer.push('<!--[0-->');
								Icon($$renderer, { data: value?.icon ?? mdiChevronDown });
								$$renderer.push(`<!----> ${$.escape(value.label)}`);
							} else {
								$$renderer.push(`<!--[-1-->No selection`);
							}

							$$renderer.push(`<!--]-->`);
						}
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Icon only</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuButton($$renderer, {
				options: optionsWithIcons,
				menuIcon: null,
				$$slots: {
					selection: ($$renderer, { value }) => {
						{
							Icon($$renderer, { data: value?.icon ?? mdiChevronDown });
						}
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Variant</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuButton($$renderer, { options, variant: 'fill', color: 'primary' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Size</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuButton($$renderer, { options, size: 'sm' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>menuProps (placement)</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuButton($$renderer, { options, menuProps: { placement: 'top-start' } });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>menuProps (matchWidth)</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuButton($$renderer, { options, menuProps: { matchWidth: true } });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>menuProps (explicitClose)</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuButton($$renderer, {
				options,
				menuProps: { placement: 'bottom-start', explicitClose: true },
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { options, setValue, close }) => {
						$$renderer.push(`<div class="p-2">`);
						TextField($$renderer, { icon: mdiMagnify, placeholder: 'Search' });
						$$renderer.push(`<!----></div> <menu><!--[-->`);

						const each_array = $.ensure_array_like(options);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let option = each_array[$$index];

							MenuItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(option.label)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></menu>`);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>options slot</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuButton($$renderer, {
				options,
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { options, setValue }) => {
						$$renderer.push(`<menu class="w-24"><!--[-->`);

						const each_array_1 = $.ensure_array_like(options);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let option = each_array_1[$$index_1];

							MenuItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(option.label)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></menu>`);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}