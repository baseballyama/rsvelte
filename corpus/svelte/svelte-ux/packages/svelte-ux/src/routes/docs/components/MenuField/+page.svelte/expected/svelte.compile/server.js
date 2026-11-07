import * as $ from 'svelte/internal/server';

import {
	mdiContentCopy,
	mdiContentCut,
	mdiContentPaste,
	mdiMagnify,
	mdiRefresh
} from '@mdi/js';

import { Button, MenuField, MenuItem, TextField } from 'svelte-ux';
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

	const optionsWithGroup = [
		{ label: 'One', value: 1, group: 'First' },
		{ label: 'Two', value: 2, group: 'First' },
		{ label: 'Three', value: 3, group: 'Second' },
		{ label: 'Four', value: 4, group: 'Second' },
		{ label: 'Five', value: 5, group: 'Second' },
		{ label: 'Six', value: 6, group: 'Third' },
		{ label: 'Seven', value: 7, group: 'Third' }
	];

	$$renderer.push(`<h1>Examples</h1> <h2>basic</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuField($$renderer, { options });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>label</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuField($$renderer, { label: 'View', options });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>value</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuField($$renderer, { options, value: 'copy' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>empty selection</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuField($$renderer, {
				options: [
					{ label: 'Please make a selection', value: null },
					...options
				]
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>icon</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuField($$renderer, { options, icon: mdiMagnify });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>option icons</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuField($$renderer, { options: optionsWithIcons });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>grouped options</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuField($$renderer, { options: optionsWithGroup });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>menuProps</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuField($$renderer, { options, menuProps: { placement: 'top-start' } });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>explicitClose</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuField($$renderer, {
				options,
				menuProps: { explicitClose: true },
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
			MenuField($$renderer, {
				options,
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { options, setValue }) => {
						$$renderer.push(`<menu><!--[-->`);

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

	$$renderer.push(`<!----> <h2>append slot</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuField($$renderer, {
				options,
				$$slots: {
					append: ($$renderer) => {
						$$renderer.push(`<div slot="append">`);
						Button($$renderer, { icon: mdiRefresh, class: 'p-2 text-surface-content/50' });
						$$renderer.push(`<!----></div>`);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>stepper</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuField($$renderer, { options, stepper: true, classes: { menuIcon: 'hidden' } });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>style</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			MenuField($$renderer, {
				options,
				classes: {
					container: 'bg-primary/10 rounded-full border-0 text-primary'
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}