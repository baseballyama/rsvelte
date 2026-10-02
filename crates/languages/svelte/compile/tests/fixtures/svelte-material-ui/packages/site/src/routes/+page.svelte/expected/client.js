import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	mdiHuman,
	mdiGestureTap,
	mdiMonitorScreenshot,
	mdiPalette,
	mdiCommentArrowLeft,
	mdiAccountGroup,
	mdiRotateRightVariant,
	mdiClipboardCheck,
	mdiLanguageTypescript
} from '@mdi/js';

import {
	siMatrix,
	siDiscord,
	siMastodon,
	siMaterialdesign,
	siSvelte,
	siSass
} from 'simple-icons';

import Paper, { Title, Content } from '@smui/paper';
import IconButton from '@smui/icon-button';
import { Icon } from '@smui/common';

var root = $.from_svg(`<path fill="currentColor"></path>`);
var root_1 = $.from_html(`<span>Svelte</span> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<span>Material</span> <!>`, 1);

var root_4 = $.from_html(
	`SMUI components follow the <a style="color: #fff;" href="https://m2.material.io/" target="_blank">Material Spec</a>, by Google. As well as implementing the components from the spec as
          closely as possible, SMUI provides additional components that aim to
          match the Material design while giving you flexibility and ease of
          development.`,
	1
);

var root_5 = $.from_html(`<span>Sass</span> <!>`, 1);

var root_6 = $.from_html(
	`SMUI is styled with Sass. SMUI provides variables to customize the
          look of the UI and mixins to help style your own elements. You can
          customize the look of your UI with <a style="color: #fff;" href="https://github.com/hperrin/svelte-material-ui/blob/master/packages/site/src/theme/_smui-theme.scss" target="_blank">just a few variables</a>.`,
	1
);

var root_7 = $.from_html(`<div style="width: 40px;"><!></div> <div style="flex-grow: 1;"><!> <!></div>`, 1);

var root_8 = $.from_html(
	`With over <a href="https://github.com/hperrin/svelte-material-ui/network/dependents?package_id=UGFja2FnZS01NTM5MDg5MDQ" target="_blank">3,000 projects</a> using SMUI components, it is the most popular Svelte UI library. For
            good reason, too. It is the most versatile and adaptable Svelte UI library,
            guaranteed.`,
	1
);

var root_9 = $.from_html(
	`SMUI supports adding arbitrary attributes and actions to every
            component and many internal elements within them. SMUI forwards all
            events from every component, and supports event modifiers, including
            passive. SMUI works in the Svelte REPL, meaning you can <a href="https://svelte.dev/repl/aa857c3bb5eb478cbe6b1fd6c6da522a" target="_blank">play with it right now</a>.`,
	1
);

var root_10 = $.from_html(`<section class="svelte-176j5ii"><div style="margin: 5em 0 6em;"><h2 style="margin-bottom: 0;">Svelte Material UI</h2> <p class="mdc-typography--subtitle1">Material UI components for Svelte apps</p></div> <div style="margin: 4em 0;"><div class="boxes svelte-176j5ii"><!> <!> <!></div> <div style="margin: 0.5em 0 6.5em; text-align: center;"><div><!> <!> <!></div> <h4 class="mdc-typography--headline6">Made with ❤️ by <a style="color: var(--mdc-on-surface);" href="https://port87.com/" target="_blank">Port87 Email</a></h4></div> <div class="features-list svelte-176j5ii"><!> <!> <!> <!> <!> <!> <!> <!> <!></div></div> <div style="margin: 4em 0;"><p>[ <a href="https://matrix.to/#/#smui:matrix.port87.help">Matrix</a> | <a href="https://discord.gg/aFzmkrmg9P">Discord</a> | <a href="https://github.com/hperrin/svelte-material-ui">GitHub</a> | <a href="https://github.com/hperrin/svelte-material-ui/issues">Issue Tracker</a> | &copy; 2019-2026 Hunter Perrin ]</p></div></section>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var section = root_10();

	$.head('176j5ii', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Svelte Material UI';
		});
	});

	var div = $.sibling($.child(section), 2);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Paper(node, {
		color: 'primary',
		class: 'box',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_2();
			var node_1 = $.first_child(fragment);

			Title(node_1, {
				style: 'display: flex; justify-content: space-between; align-items: center;',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_1();
					var node_2 = $.sibling($.first_child(fragment_1), 2);

					Icon(node_2, {
						tag: 'svg',
						style: 'width: 1em; height: auto;',
						viewBox: '0 0 24 24',
						children: ($$anchor, $$slotProps) => {
							var path = root();

							$.template_effect(() => $.set_attribute(path, 'd', siSvelte.path));
							$.append($$anchor, path);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_1, 2);

			Content(node_3, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('SMUI provides strictly typed Svelte components and actions for a wide\n          variety of interface elements. SMUI also provides helper utilities for\n          building custom and advanced UI components.');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	Paper(node_4, {
		color: 'svelte-blue',
		class: 'box',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_2();
			var node_5 = $.first_child(fragment_2);

			Title(node_5, {
				style: 'display: flex; justify-content: space-between; align-items: center;',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_3();
					var node_6 = $.sibling($.first_child(fragment_3), 2);

					Icon(node_6, {
						tag: 'svg',
						style: 'width: 1em; height: auto;',
						viewBox: '0 0 24 24',
						children: ($$anchor, $$slotProps) => {
							var path_1 = root();

							$.template_effect(() => $.set_attribute(path_1, 'd', siMaterialdesign.path));
							$.append($$anchor, path_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_5, 2);

			Content(node_7, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_4 = root_4();

					$.next(2);
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_4, 2);

	Paper(node_8, {
		color: 'secondary',
		class: 'box',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_2();
			var node_9 = $.first_child(fragment_5);

			Title(node_9, {
				style: 'display: flex; justify-content: space-between; align-items: center;',
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_5();
					var node_10 = $.sibling($.first_child(fragment_6), 2);

					Icon(node_10, {
						tag: 'svg',
						style: 'width: 1em; height: auto;',
						viewBox: '0 0 24 24',
						children: ($$anchor, $$slotProps) => {
							var path_2 = root();

							$.template_effect(() => $.set_attribute(path_2, 'd', siSass.path));
							$.append($$anchor, path_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_9, 2);

			Content(node_11, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_7 = root_6();

					$.next(2);
					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.child(div_2);
	var node_12 = $.child(div_3);

	IconButton(node_12, {
		href: 'https://matrix.to/#/#smui:matrix.port87.help',
		style: 'color: var(--mdc-on-surface);',
		title: 'Join the Matrix Space',
		children: ($$anchor, $$slotProps) => {
			Icon($$anchor, {
				tag: 'svg',
				viewBox: '0 0 24 24',
				children: ($$anchor, $$slotProps) => {
					var path_3 = root();

					$.template_effect(() => $.set_attribute(path_3, 'd', siMatrix.path));
					$.append($$anchor, path_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 2);

	IconButton(node_13, {
		href: 'https://discord.gg/aFzmkrmg9P',
		style: 'color: var(--mdc-on-surface);',
		title: 'Join the Discord Server',
		children: ($$anchor, $$slotProps) => {
			Icon($$anchor, {
				tag: 'svg',
				viewBox: '0 0 24 24',
				children: ($$anchor, $$slotProps) => {
					var path_4 = root();

					$.template_effect(() => $.set_attribute(path_4, 'd', siDiscord.path));
					$.append($$anchor, path_4);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_13, 2);

	IconButton(node_14, {
		href: 'https://port87.social/@hperrin',
		style: 'color: var(--mdc-on-surface);',
		title: 'Hunter Perrin (SMUI Author) on Mastodon',
		children: ($$anchor, $$slotProps) => {
			Icon($$anchor, {
				tag: 'svg',
				viewBox: '0 0 24 24',
				children: ($$anchor, $$slotProps) => {
					var path_5 = root();

					$.template_effect(() => $.set_attribute(path_5, 'd', siMastodon.path));
					$.append($$anchor, path_5);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.next(2);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var node_15 = $.child(div_4);

	Paper(node_15, {
		variant: 'outlined',
		color: 'primary',
		children: ($$anchor, $$slotProps) => {
			var fragment_11 = root_7();
			var div_5 = $.first_child(fragment_11);
			var node_16 = $.child(div_5);

			Icon(node_16, {
				tag: 'svg',
				style: 'width: 40px; height: 40px;',
				viewBox: '0 0 24 24',
				children: ($$anchor, $$slotProps) => {
					var path_6 = root();

					$.template_effect(() => $.set_attribute(path_6, 'd', mdiLanguageTypescript));
					$.append($$anchor, path_6);
				},
				$$slots: { default: true }
			});

			$.reset(div_5);

			var div_6 = $.sibling(div_5, 2);
			var node_17 = $.child(div_6);

			Title(node_17, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Fully, Strictly Typed');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_18 = $.sibling(node_17, 2);

			Content(node_18, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('SMUI is strictly typed with TypeScript. This not only helps catch\n            bugs early, it helps while developing as every property is\n            autocompleted by modern IDEs.');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.reset(div_6);
			$.append($$anchor, fragment_11);
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node_15, 2);

	Paper(node_19, {
		variant: 'outlined',
		color: 'secondary',
		children: ($$anchor, $$slotProps) => {
			var fragment_12 = root_7();
			var div_7 = $.first_child(fragment_12);
			var node_20 = $.child(div_7);

			Icon(node_20, {
				tag: 'svg',
				style: 'width: 40px; height: 40px;',
				viewBox: '0 0 24 24',
				children: ($$anchor, $$slotProps) => {
					var path_7 = root();

					$.template_effect(() => $.set_attribute(path_7, 'd', mdiHuman));
					$.append($$anchor, path_7);
				},
				$$slots: { default: true }
			});

			$.reset(div_7);

			var div_8 = $.sibling(div_7, 2);
			var node_21 = $.child(div_8);

			Title(node_21, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Accessible by Default');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_22 = $.sibling(node_21, 2);

			Content(node_22, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('SMUI automatically adds appropriate ARIA attributes to components to\n            provide accessibility to screen readers. SMUI is also fully keyboard\n            accessible, meaning motor impaired users can easily use SMUI\n            components.');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.reset(div_8);
			$.append($$anchor, fragment_12);
		},
		$$slots: { default: true }
	});

	var node_23 = $.sibling(node_19, 2);

	Paper(node_23, {
		variant: 'outlined',
		color: 'primary',
		children: ($$anchor, $$slotProps) => {
			var fragment_13 = root_7();
			var div_9 = $.first_child(fragment_13);
			var node_24 = $.child(div_9);

			Icon(node_24, {
				tag: 'svg',
				style: 'width: 40px; height: 40px;',
				viewBox: '0 0 24 24',
				children: ($$anchor, $$slotProps) => {
					var path_8 = root();

					$.template_effect(() => $.set_attribute(path_8, 'd', mdiGestureTap));
					$.append($$anchor, path_8);
				},
				$$slots: { default: true }
			});

			$.reset(div_9);

			var div_10 = $.sibling(div_9, 2);
			var node_25 = $.child(div_10);

			Title(node_25, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Touch Friendly');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var node_26 = $.sibling(node_25, 2);

			Content(node_26, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('SMUI provides increased touch targets to allow ease of use on mobile\n            devices, conforming to the Material Spec requirement of minimum 48px\n            x 48px touch targets.');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			$.reset(div_10);
			$.append($$anchor, fragment_13);
		},
		$$slots: { default: true }
	});

	var node_27 = $.sibling(node_23, 2);

	Paper(node_27, {
		variant: 'outlined',
		color: 'secondary',
		children: ($$anchor, $$slotProps) => {
			var fragment_14 = root_7();
			var div_11 = $.first_child(fragment_14);
			var node_28 = $.child(div_11);

			Icon(node_28, {
				tag: 'svg',
				style: 'width: 40px; height: 40px;',
				viewBox: '0 0 24 24',
				children: ($$anchor, $$slotProps) => {
					var path_9 = root();

					$.template_effect(() => $.set_attribute(path_9, 'd', mdiMonitorScreenshot));
					$.append($$anchor, path_9);
				},
				$$slots: { default: true }
			});

			$.reset(div_11);

			var div_12 = $.sibling(div_11, 2);
			var node_29 = $.child(div_12);

			Title(node_29, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('Server Side Rendering');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			var node_30 = $.sibling(node_29, 2);

			Content(node_30, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('SMUI can be fully rendered on the server, meaning faster time to\n            first meaningful paint. SMUI fully supports SvelteKit. In fact, the\n            site you\'re looking at is a SvelteKit app.');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			$.reset(div_12);
			$.append($$anchor, fragment_14);
		},
		$$slots: { default: true }
	});

	var node_31 = $.sibling(node_27, 2);

	Paper(node_31, {
		variant: 'outlined',
		color: 'primary',
		children: ($$anchor, $$slotProps) => {
			var fragment_15 = root_7();
			var div_13 = $.first_child(fragment_15);
			var node_32 = $.child(div_13);

			Icon(node_32, {
				tag: 'svg',
				style: 'width: 40px; height: 40px;',
				viewBox: '0 0 24 24',
				children: ($$anchor, $$slotProps) => {
					var path_10 = root();

					$.template_effect(() => $.set_attribute(path_10, 'd', mdiPalette));
					$.append($$anchor, path_10);
				},
				$$slots: { default: true }
			});

			$.reset(div_13);

			var div_14 = $.sibling(div_13, 2);
			var node_33 = $.child(div_14);

			Title(node_33, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_9 = $.text('Fully Themable');

					$.append($$anchor, text_9);
				},
				$$slots: { default: true }
			});

			var node_34 = $.sibling(node_33, 2);

			Content(node_34, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_10 = $.text('Components are themable using Sass variables. Everything from their\n            shape, color, density, borders, interaction states, and more is\n            themable.');

					$.append($$anchor, text_10);
				},
				$$slots: { default: true }
			});

			$.reset(div_14);
			$.append($$anchor, fragment_15);
		},
		$$slots: { default: true }
	});

	var node_35 = $.sibling(node_31, 2);

	Paper(node_35, {
		variant: 'outlined',
		color: 'secondary',
		children: ($$anchor, $$slotProps) => {
			var fragment_16 = root_7();
			var div_15 = $.first_child(fragment_16);
			var node_36 = $.child(div_15);

			Icon(node_36, {
				tag: 'svg',
				style: 'width: 40px; height: 40px;',
				viewBox: '0 0 24 24',
				children: ($$anchor, $$slotProps) => {
					var path_11 = root();

					$.template_effect(() => $.set_attribute(path_11, 'd', mdiCommentArrowLeft));
					$.append($$anchor, path_11);
				},
				$$slots: { default: true }
			});

			$.reset(div_15);

			var div_16 = $.sibling(div_15, 2);
			var node_37 = $.child(div_16);

			Title(node_37, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_11 = $.text('RTL/Internationalization Support');

					$.append($$anchor, text_11);
				},
				$$slots: { default: true }
			});

			var node_38 = $.sibling(node_37, 2);

			Content(node_38, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_12 = $.text('SMUI is RTL aware, and components will adapt their design to suit\n            the language of the user.');

					$.append($$anchor, text_12);
				},
				$$slots: { default: true }
			});

			$.reset(div_16);
			$.append($$anchor, fragment_16);
		},
		$$slots: { default: true }
	});

	var node_39 = $.sibling(node_35, 2);

	Paper(node_39, {
		variant: 'outlined',
		color: 'primary',
		children: ($$anchor, $$slotProps) => {
			var fragment_17 = root_7();
			var div_17 = $.first_child(fragment_17);
			var node_40 = $.child(div_17);

			Icon(node_40, {
				tag: 'svg',
				style: 'width: 40px; height: 40px;',
				viewBox: '0 0 24 24',
				children: ($$anchor, $$slotProps) => {
					var path_12 = root();

					$.template_effect(() => $.set_attribute(path_12, 'd', mdiAccountGroup));
					$.append($$anchor, path_12);
				},
				$$slots: { default: true }
			});

			$.reset(div_17);

			var div_18 = $.sibling(div_17, 2);
			var node_41 = $.child(div_18);

			Title(node_41, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_13 = $.text('Widely Used, a Growing Community');

					$.append($$anchor, text_13);
				},
				$$slots: { default: true }
			});

			var node_42 = $.sibling(node_41, 2);

			Content(node_42, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_18 = root_8();

					$.next(2);
					$.append($$anchor, fragment_18);
				},
				$$slots: { default: true }
			});

			$.reset(div_18);
			$.append($$anchor, fragment_17);
		},
		$$slots: { default: true }
	});

	var node_43 = $.sibling(node_39, 2);

	Paper(node_43, {
		variant: 'outlined',
		color: 'secondary',
		children: ($$anchor, $$slotProps) => {
			var fragment_19 = root_7();
			var div_19 = $.first_child(fragment_19);
			var node_44 = $.child(div_19);

			Icon(node_44, {
				tag: 'svg',
				style: 'width: 40px; height: 40px;',
				viewBox: '0 0 24 24',
				children: ($$anchor, $$slotProps) => {
					var path_13 = root();

					$.template_effect(() => $.set_attribute(path_13, 'd', mdiRotateRightVariant));
					$.append($$anchor, path_13);
				},
				$$slots: { default: true }
			});

			$.reset(div_19);

			var div_20 = $.sibling(div_19, 2);
			var node_45 = $.child(div_20);

			Title(node_45, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_14 = $.text('Adaptable, Versatile');

					$.append($$anchor, text_14);
				},
				$$slots: { default: true }
			});

			var node_46 = $.sibling(node_45, 2);

			Content(node_46, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_20 = root_9();

					$.next(2);
					$.append($$anchor, fragment_20);
				},
				$$slots: { default: true }
			});

			$.reset(div_20);
			$.append($$anchor, fragment_19);
		},
		$$slots: { default: true }
	});

	var node_47 = $.sibling(node_43, 2);

	Paper(node_47, {
		variant: 'outlined',
		color: 'primary',
		children: ($$anchor, $$slotProps) => {
			var fragment_21 = root_7();
			var div_21 = $.first_child(fragment_21);
			var node_48 = $.child(div_21);

			Icon(node_48, {
				tag: 'svg',
				style: 'width: 40px; height: 40px;',
				viewBox: '0 0 24 24',
				children: ($$anchor, $$slotProps) => {
					var path_14 = root();

					$.template_effect(() => $.set_attribute(path_14, 'd', mdiClipboardCheck));
					$.append($$anchor, path_14);
				},
				$$slots: { default: true }
			});

			$.reset(div_21);

			var div_22 = $.sibling(div_21, 2);
			var node_49 = $.child(div_22);

			Title(node_49, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_15 = $.text('Material Design Compliant');

					$.append($$anchor, text_15);
				},
				$$slots: { default: true }
			});

			var node_50 = $.sibling(node_49, 2);

			Content(node_50, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_16 = $.text('Every SMUI component fully follows the Material Design\n            specification. You can build up-to-spec UIs with SMUI.');

					$.append($$anchor, text_16);
				},
				$$slots: { default: true }
			});

			$.reset(div_22);
			$.append($$anchor, fragment_21);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);
	$.reset(div);
	$.next(2);
	$.reset(section);
	$.append($$anchor, section);
	$.pop();
}