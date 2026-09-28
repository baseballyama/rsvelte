import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	mdiContentCopy,
	mdiContentCut,
	mdiContentPaste,
	mdiMagnify,
	mdiRefresh
} from '@mdi/js';

import { Button, MenuField, MenuItem, TextField } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div class="p-2"><!></div> <menu></menu>`, 1);
var root_1 = $.from_html(`<menu></menu>`);
var root_2 = $.from_html(`<div slot="append"><!></div>`);
var root_3 = $.from_html(`<h1>Examples</h1> <h2>basic</h2> <!> <h2>label</h2> <!> <h2>value</h2> <!> <h2>empty selection</h2> <!> <h2>icon</h2> <!> <h2>option icons</h2> <!> <h2>grouped options</h2> <!> <h2>menuProps</h2> <!> <h2>explicitClose</h2> <!> <h2>options slot</h2> <!> <h2>append slot</h2> <!> <h2>stepper</h2> <!> <h2>style</h2> <!>`, 1);

export default function _page($$anchor) {
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

	var fragment = root_3();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			MenuField($$anchor, {
				get options() {
					return options;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			MenuField($$anchor, {
				label: 'View',
				get options() {
					return options;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			MenuField($$anchor, {
				get options() {
					return options;
				},
				value: 'copy'
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => [
					{ label: 'Please make a selection', value: null },
					...options
				]);

				MenuField($$anchor, {
					get options() {
						return $.get($0);
					}
				});
			}
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			MenuField($$anchor, {
				get options() {
					return options;
				},

				get icon() {
					return mdiMagnify;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 4);

	Preview(node_5, {
		children: ($$anchor, $$slotProps) => {
			MenuField($$anchor, {
				get options() {
					return optionsWithIcons;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 4);

	Preview(node_6, {
		children: ($$anchor, $$slotProps) => {
			MenuField($$anchor, {
				get options() {
					return optionsWithGroup;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 4);

	Preview(node_7, {
		children: ($$anchor, $$slotProps) => {
			MenuField($$anchor, {
				get options() {
					return options;
				},
				menuProps: { placement: 'top-start' }
			});
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 4);

	Preview(node_8, {
		children: ($$anchor, $$slotProps) => {
			MenuField($$anchor, {
				get options() {
					return options;
				},
				menuProps: { explicitClose: true },
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const options = $.derived(() => $$slotProps.options);
						const setValue = $.derived(() => $$slotProps.setValue);
						const close = $.derived(() => $$slotProps.close);
						var fragment_10 = root();
						var div = $.first_child(fragment_10);
						var node_9 = $.child(div);

						TextField(node_9, {
							get icon() {
								return mdiMagnify;
							},
							placeholder: 'Search'
						});

						$.reset(div);

						var menu = $.sibling(div, 2);

						$.each(menu, 21, () => $.get(options), $.index, ($$anchor, option) => {
							MenuItem($$anchor, {
								$$events: {
									click: () => {
										$.get(setValue)($.get(option).value);
										$.get(close)();
									}
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text();

									$.template_effect(() => $.set_text(text, $.get(option).label));
									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						$.reset(menu);
						$.append($$anchor, fragment_10);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_8, 4);

	Preview(node_10, {
		children: ($$anchor, $$slotProps) => {
			MenuField($$anchor, {
				get options() {
					return options;
				},
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const options = $.derived(() => $$slotProps.options);
						const setValue = $.derived(() => $$slotProps.setValue);
						var menu_1 = root_1();

						$.each(menu_1, 21, () => $.get(options), $.index, ($$anchor, option) => {
							MenuItem($$anchor, {
								$$events: { click: () => $.get(setValue)($.get(option).value) },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text();

									$.template_effect(() => $.set_text(text_1, $.get(option).label));
									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						$.reset(menu_1);
						$.append($$anchor, menu_1);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 4);

	Preview(node_11, {
		children: ($$anchor, $$slotProps) => {
			MenuField($$anchor, {
				get options() {
					return options;
				},

				$$slots: {
					append: ($$anchor, $$slotProps) => {
						var div_1 = root_2();
						var node_12 = $.child(div_1);

						Button(node_12, {
							get icon() {
								return mdiRefresh;
							},
							class: 'p-2 text-surface-content/50'
						});

						$.reset(div_1);
						$.append($$anchor, div_1);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_11, 4);

	Preview(node_13, {
		children: ($$anchor, $$slotProps) => {
			MenuField($$anchor, {
				get options() {
					return options;
				},
				stepper: true,
				classes: { menuIcon: 'hidden' }
			});
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_13, 4);

	Preview(node_14, {
		children: ($$anchor, $$slotProps) => {
			MenuField($$anchor, {
				get options() {
					return options;
				},

				classes: {
					container: 'bg-primary/10 rounded-full border-0 text-primary'
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}