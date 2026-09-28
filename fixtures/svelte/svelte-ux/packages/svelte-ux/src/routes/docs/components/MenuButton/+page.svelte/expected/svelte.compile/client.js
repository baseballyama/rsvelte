import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	mdiContentCopy,
	mdiContentCut,
	mdiContentPaste,
	mdiMagnify,
	mdiChevronDown
} from '@mdi/js';

import { Icon, MenuButton, MenuItem, TextField } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<div class="p-2"><!></div> <menu></menu>`, 1);
var root_2 = $.from_html(`<menu class="w-24"></menu>`);
var root_3 = $.from_html(`<h1>Examples</h1> <h2>Basic</h2> <!> <h2>Label</h2> <!> <h2>Value</h2> <!> <h2>Icon</h2> <!> <h2>Option icons</h2> <!> <h2>Option icons with selected icon</h2> <!> <h2>Icon only</h2> <!> <h2>Variant</h2> <!> <h2>Size</h2> <!> <h2>menuProps (placement)</h2> <!> <h2>menuProps (matchWidth)</h2> <!> <h2>menuProps (explicitClose)</h2> <!> <h2>options slot</h2> <!>`, 1);

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

	var fragment = root_3();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			MenuButton($$anchor, {
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
			MenuButton($$anchor, {
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
			MenuButton($$anchor, {
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
			MenuButton($$anchor, {
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

	var node_4 = $.sibling(node_3, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			MenuButton($$anchor, {
				get options() {
					return optionsWithIcons;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 4);

	Preview(node_5, {
		children: ($$anchor, $$slotProps) => {
			MenuButton($$anchor, {
				get options() {
					return optionsWithIcons;
				},

				$$slots: {
					selection: ($$anchor, $$slotProps) => {
						const value = $.derived(() => $$slotProps.value);
						var fragment_7 = $.comment();
						var node_6 = $.first_child(fragment_7);

						{
							var consequent = ($$anchor) => {
								var fragment_8 = root();
								var node_7 = $.first_child(fragment_8);

								{
									let $0 = $.derived(() => $.get(value)?.icon ?? mdiChevronDown);

									Icon(node_7, {
										get data() {
											return $.get($0);
										}
									});
								}

								var text = $.sibling(node_7);

								$.template_effect(() => $.set_text(text, ` ${$.get(value).label ?? ''}`));
								$.append($$anchor, fragment_8);
							};

							var alternate = ($$anchor) => {
								var text_1 = $.text('No selection');

								$.append($$anchor, text_1);
							};

							$.if(node_6, ($$render) => {
								if ($.get(value)) $$render(consequent); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_7);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_5, 4);

	Preview(node_8, {
		children: ($$anchor, $$slotProps) => {
			MenuButton($$anchor, {
				get options() {
					return optionsWithIcons;
				},
				menuIcon: null,
				$$slots: {
					selection: ($$anchor, $$slotProps) => {
						const value = $.derived(() => $$slotProps.value);

						{
							let $0 = $.derived(() => $.get(value)?.icon ?? mdiChevronDown);

							Icon($$anchor, {
								get data() {
									return $.get($0);
								}
							});
						}
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 4);

	Preview(node_9, {
		children: ($$anchor, $$slotProps) => {
			MenuButton($$anchor, {
				get options() {
					return options;
				},
				variant: 'fill',
				color: 'primary'
			});
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 4);

	Preview(node_10, {
		children: ($$anchor, $$slotProps) => {
			MenuButton($$anchor, {
				get options() {
					return options;
				},
				size: 'sm'
			});
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 4);

	Preview(node_11, {
		children: ($$anchor, $$slotProps) => {
			MenuButton($$anchor, {
				get options() {
					return options;
				},
				menuProps: { placement: 'top-start' }
			});
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 4);

	Preview(node_12, {
		children: ($$anchor, $$slotProps) => {
			MenuButton($$anchor, {
				get options() {
					return options;
				},
				menuProps: { matchWidth: true }
			});
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 4);

	Preview(node_13, {
		children: ($$anchor, $$slotProps) => {
			MenuButton($$anchor, {
				get options() {
					return options;
				},
				menuProps: { placement: 'bottom-start', explicitClose: true },
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const options = $.derived(() => $$slotProps.options);
						const setValue = $.derived(() => $$slotProps.setValue);
						const close = $.derived(() => $$slotProps.close);
						var fragment_16 = root_1();
						var div = $.first_child(fragment_16);
						var node_14 = $.child(div);

						TextField(node_14, {
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

									var text_2 = $.text();

									$.template_effect(() => $.set_text(text_2, $.get(option).label));
									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						$.reset(menu);
						$.append($$anchor, fragment_16);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_13, 4);

	Preview(node_15, {
		children: ($$anchor, $$slotProps) => {
			MenuButton($$anchor, {
				get options() {
					return options;
				},
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const options = $.derived(() => $$slotProps.options);
						const setValue = $.derived(() => $$slotProps.setValue);
						var menu_1 = root_2();

						$.each(menu_1, 21, () => $.get(options), $.index, ($$anchor, option) => {
							MenuItem($$anchor, {
								$$events: { click: () => $.get(setValue)($.get(option).value) },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text();

									$.template_effect(() => $.set_text(text_3, $.get(option).label));
									$.append($$anchor, text_3);
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

	$.append($$anchor, fragment);
}