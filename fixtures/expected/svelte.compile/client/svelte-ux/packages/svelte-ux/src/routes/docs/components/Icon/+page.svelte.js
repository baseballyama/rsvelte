import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	mdiAccount,
	mdiCheck,
	mdiDecagramOutline,
	mdiLoading,
	mdiDownload,
	mdiHeart,
	mdiCircleMedium,
	mdiArrowRight,
	mdiOpenInNew,
	mdiMenuUp,
	mdiMenuDown
} from '@mdi/js';

import { faUser } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup, Icon, Tooltip } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:FILL@0..1" rel="stylesheet"/>`);
var root_1 = $.from_svg(`<svg width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4Z"></path></svg>`);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<span class="material-symbols-outlined">person</span>`);
var root_5 = $.from_html(`<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1">person</span>`);
var root_6 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_8 = $.from_html(`<h1>Examples</h1> <div class="grid grid-cols-[1fr,auto] items-center gap-2"><h2>Material Design icons</h2> <!></div> <!> <div class="grid grid-cols-[1fr,auto] items-center gap-2"><h2>Font Awesome icons</h2> <!></div> <!> <div class="grid grid-cols-[1fr,auto] items-center gap-2"><h2>Material Symbols font</h2> <!></div> <!> <h2>Sizes</h2> <!> <h2>Color</h2> <!> <h2>Multiple paths</h2> <!> <h2>Rotate / Scale / Flip</h2> <!> <h2>Animation</h2> <!> <h2>with Tooltip</h2> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root_8();

	$.head('h6y0j9', ($$anchor) => {
		var link = root();

		$.append($$anchor, link);
	});

	var div = $.sibling($.first_child(fragment), 2);
	var node = $.sibling($.child(div), 2);

	ButtonGroup(node, {
		variant: 'fill-light',
		color: 'primary',
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				href: 'https://pictogrammers.com/library/mdi/',
				target: '_blank',
				class: 'flex-row-reverse',
				get icon() {
					return mdiOpenInNew;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Icons');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_2();
			var node_2 = $.first_child(fragment_2);

			Icon(node_2, {
				get data() {
					return mdiAccount;
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Icon(node_3, {
				svg: '<svg width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4Z"/></svg>'
			});

			var node_4 = $.sibling(node_3, 2);

			Icon(node_4, { svgUrl: 'https://api.iconify.design/mdi:account.svg' });

			var node_5 = $.sibling(node_4, 2);

			Icon(node_5, {
				children: ($$anchor, $$slotProps) => {
					var svg = root_1();

					$.append($$anchor, svg);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node_1, 2);
	var node_6 = $.sibling($.child(div_1), 2);

	ButtonGroup(node_6, {
		variant: 'fill-light',
		color: 'primary',
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				href: 'https://fontawesome.com/icons',
				target: '_blank',
				class: 'flex-row-reverse',
				get icon() {
					return mdiOpenInNew;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Icons');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var node_7 = $.sibling(div_1, 2);

	Preview(node_7, {
		children: ($$anchor, $$slotProps) => {
			Icon($$anchor, {
				get data() {
					return faUser;
				}
			});
		},
		$$slots: { default: true }
	});

	var div_2 = $.sibling(node_7, 2);
	var node_8 = $.sibling($.child(div_2), 2);

	ButtonGroup(node_8, {
		variant: 'fill-light',
		color: 'primary',
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_3();
			var node_9 = $.first_child(fragment_5);

			Button(node_9, {
				href: 'https://fonts.google.com/icons',
				target: '_blank',
				class: 'flex-row-reverse',
				get icon() {
					return mdiOpenInNew;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Icons');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			Button(node_10, {
				href: 'https://developers.google.com/fonts/docs/material_symbols',
				target: '_blank',
				class: 'flex-row-reverse',
				get icon() {
					return mdiOpenInNew;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Docs');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var node_11 = $.sibling(div_2, 2);

	Preview(node_11, {
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_3();
			var node_12 = $.first_child(fragment_6);

			Icon(node_12, {
				children: ($$anchor, $$slotProps) => {
					var span = root_4();

					$.append($$anchor, span);
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_12, 2);

			Icon(node_13, {
				children: ($$anchor, $$slotProps) => {
					var span_1 = root_5();

					$.append($$anchor, span_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_11, 4);

	Preview(node_14, {
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root_6();
			var node_15 = $.first_child(fragment_7);

			Icon(node_15, {
				get data() {
					return mdiAccount;
				},
				size: '8px'
			});

			var node_16 = $.sibling(node_15, 2);

			Icon(node_16, {
				get data() {
					return mdiAccount;
				},
				size: '1em'
			});

			var node_17 = $.sibling(node_16, 2);

			Icon(node_17, {
				get data() {
					return mdiAccount;
				},
				size: '1.5em'
			});

			var node_18 = $.sibling(node_17, 2);

			Icon(node_18, {
				get data() {
					return mdiAccount;
				},
				size: '2em'
			});

			var node_19 = $.sibling(node_18, 2);

			Icon(node_19, {
				get data() {
					return mdiAccount;
				},
				size: '2.5em'
			});

			var node_20 = $.sibling(node_19, 2);

			Icon(node_20, {
				get data() {
					return mdiAccount;
				},
				size: '3em'
			});

			var node_21 = $.sibling(node_20, 2);

			Icon(node_21, {
				get data() {
					return mdiAccount;
				},
				size: '64px'
			});

			var node_22 = $.sibling(node_21, 2);

			Icon(node_22, {
				svgUrl: 'https://api.iconify.design/mdi:account.svg',
				size: '64px'
			});

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	var node_23 = $.sibling(node_14, 4);

	Preview(node_23, {
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root_6();
			var node_24 = $.first_child(fragment_8);

			Icon(node_24, {
				get data() {
					return mdiAccount;
				},
				class: 'text-danger'
			});

			var node_25 = $.sibling(node_24, 2);

			Icon(node_25, {
				get data() {
					return mdiAccount;
				},
				class: 'text-primary'
			});

			var node_26 = $.sibling(node_25, 2);

			Icon(node_26, {
				get data() {
					return mdiAccount;
				},
				class: 'text-success'
			});

			var node_27 = $.sibling(node_26, 2);

			Icon(node_27, {
				get data() {
					return mdiAccount;
				},
				class: 'text-surface-content/50'
			});

			var node_28 = $.sibling(node_27, 2);

			Icon(node_28, {
				svgUrl: 'https://api.iconify.design/mdi:account.svg',
				class: 'text-danger'
			});

			var node_29 = $.sibling(node_28, 2);

			Icon(node_29, {
				svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/></svg>',
				class: 'fill-primary'
			});

			var node_30 = $.sibling(node_29, 2);

			Icon(node_30, {
				svgUrl: 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/user.svg',
				class: 'text-success'
			});

			var node_31 = $.sibling(node_30, 2);

			Icon(node_31, {
				get data() {
					return mdiAccount;
				},
				style: 'color:red'
			});

			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	var node_32 = $.sibling(node_23, 4);

	Preview(node_32, {
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_3();
			var node_33 = $.first_child(fragment_9);

			{
				let $0 = $.derived(() => [mdiDecagramOutline, mdiCheck]);

				Icon(node_33, {
					get path() {
						return $.get($0);
					},
					classes: { path: ['', 'text-primary scale-50 origin-center'] }
				});
			}

			var node_34 = $.sibling(node_33, 2);

			{
				let $0 = $.derived(() => [mdiMenuUp, mdiMenuDown]);

				Icon(node_34, {
					get path() {
						return $.get($0);
					},

					classes: {
						path: ['translate-y-[-4px]', 'translate-y-[4px] text-primary']
					}
				});
			}

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	var node_35 = $.sibling(node_32, 4);

	Preview(node_35, {
		children: ($$anchor, $$slotProps) => {
			var fragment_10 = root_7();
			var node_36 = $.first_child(fragment_10);

			Icon(node_36, {
				get data() {
					return mdiArrowRight;
				},
				class: '-rotate-45'
			});

			var node_37 = $.sibling(node_36, 2);

			Icon(node_37, {
				get data() {
					return mdiArrowRight;
				},
				class: 'scale-75'
			});

			var node_38 = $.sibling(node_37, 2);

			Icon(node_38, {
				get data() {
					return mdiArrowRight;
				},
				class: '-scale-x-100'
			});

			var node_39 = $.sibling(node_38, 2);

			Icon(node_39, {
				get data() {
					return mdiAccount;
				},
				class: '-scale-y-100'
			});

			var node_40 = $.sibling(node_39, 2);

			Icon(node_40, {
				svgUrl: 'https://api.iconify.design/mdi:account.svg',
				class: '-scale-y-100'
			});

			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	var node_41 = $.sibling(node_35, 4);

	Preview(node_41, {
		children: ($$anchor, $$slotProps) => {
			var fragment_11 = root_2();
			var node_42 = $.first_child(fragment_11);

			Icon(node_42, {
				get data() {
					return mdiLoading;
				},
				class: 'animate-spin'
			});

			var node_43 = $.sibling(node_42, 2);

			Icon(node_43, {
				get data() {
					return mdiHeart;
				},
				class: 'animate-pulse'
			});

			var node_44 = $.sibling(node_43, 2);

			Icon(node_44, {
				get data() {
					return mdiCircleMedium;
				},
				class: 'animate-ping'
			});

			var node_45 = $.sibling(node_44, 2);

			Icon(node_45, {
				get data() {
					return mdiDownload;
				},
				class: 'animate-bounce'
			});

			$.append($$anchor, fragment_11);
		},
		$$slots: { default: true }
	});

	var node_46 = $.sibling(node_41, 4);

	Preview(node_46, {
		children: ($$anchor, $$slotProps) => {
			var fragment_12 = root_2();
			var node_47 = $.first_child(fragment_12);

			Tooltip(node_47, {
				title: 'User',
				children: ($$anchor, $$slotProps) => {
					Icon($$anchor, {
						get data() {
							return mdiAccount;
						}
					});
				},
				$$slots: { default: true }
			});

			var node_48 = $.sibling(node_47, 2);

			Tooltip(node_48, {
				title: 'User',
				children: ($$anchor, $$slotProps) => {
					Icon($$anchor, { svgUrl: 'https://api.iconify.design/mdi:account.svg' });
				},
				$$slots: { default: true }
			});

			var node_49 = $.sibling(node_48, 2);

			Tooltip(node_49, {
				title: 'User',
				children: ($$anchor, $$slotProps) => {
					Icon($$anchor, {
						svg: '<svg width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4Z"/></svg>'
					});
				},
				$$slots: { default: true }
			});

			var node_50 = $.sibling(node_49, 2);

			Tooltip(node_50, {
				title: 'User',
				children: ($$anchor, $$slotProps) => {
					Icon($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var svg_1 = root_1();

							$.append($$anchor, svg_1);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_12);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}