import * as $ from 'svelte/internal/server';

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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$.head('176j5ii', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Svelte Material UI</title>`);
			});
		});

		$$renderer.push(`<section class="svelte-176j5ii"><div style="margin: 5em 0 6em;"><h2 style="margin-bottom: 0;">Svelte Material UI</h2> <p class="mdc-typography--subtitle1">Material UI components for Svelte apps</p></div> <div style="margin: 4em 0;"><div class="boxes svelte-176j5ii">`);

		Paper($$renderer, {
			color: 'primary',
			class: 'box',
			children: ($$renderer) => {
				Title($$renderer, {
					style: 'display: flex; justify-content: space-between; align-items: center;',
					children: ($$renderer) => {
						$$renderer.push(`<span>Svelte</span> `);

						Icon($$renderer, {
							tag: 'svg',
							style: 'width: 1em; height: auto;',
							viewBox: '0 0 24 24',
							children: ($$renderer) => {
								$$renderer.push(`<path fill="currentColor"${$.attr('d', siSvelte.path)}></path>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Content($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->SMUI provides strictly typed Svelte components and actions for a wide
          variety of interface elements. SMUI also provides helper utilities for
          building custom and advanced UI components.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Paper($$renderer, {
			color: 'svelte-blue',
			class: 'box',
			children: ($$renderer) => {
				Title($$renderer, {
					style: 'display: flex; justify-content: space-between; align-items: center;',
					children: ($$renderer) => {
						$$renderer.push(`<span>Material</span> `);

						Icon($$renderer, {
							tag: 'svg',
							style: 'width: 1em; height: auto;',
							viewBox: '0 0 24 24',
							children: ($$renderer) => {
								$$renderer.push(`<path fill="currentColor"${$.attr('d', siMaterialdesign.path)}></path>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Content($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->SMUI components follow the <a style="color: #fff;" href="https://m2.material.io/" target="_blank">Material Spec</a>, by Google. As well as implementing the components from the spec as
          closely as possible, SMUI provides additional components that aim to
          match the Material design while giving you flexibility and ease of
          development.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Paper($$renderer, {
			color: 'secondary',
			class: 'box',
			children: ($$renderer) => {
				Title($$renderer, {
					style: 'display: flex; justify-content: space-between; align-items: center;',
					children: ($$renderer) => {
						$$renderer.push(`<span>Sass</span> `);

						Icon($$renderer, {
							tag: 'svg',
							style: 'width: 1em; height: auto;',
							viewBox: '0 0 24 24',
							children: ($$renderer) => {
								$$renderer.push(`<path fill="currentColor"${$.attr('d', siSass.path)}></path>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Content($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->SMUI is styled with Sass. SMUI provides variables to customize the
          look of the UI and mixins to help style your own elements. You can
          customize the look of your UI with <a style="color: #fff;" href="https://github.com/hperrin/svelte-material-ui/blob/master/packages/site/src/theme/_smui-theme.scss" target="_blank">just a few variables</a>.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div style="margin: 0.5em 0 6.5em; text-align: center;"><div>`);

		IconButton($$renderer, {
			href: 'https://matrix.to/#/#smui:matrix.port87.help',
			style: 'color: var(--mdc-on-surface);',
			title: 'Join the Matrix Space',
			children: ($$renderer) => {
				Icon($$renderer, {
					tag: 'svg',
					viewBox: '0 0 24 24',
					children: ($$renderer) => {
						$$renderer.push(`<path fill="currentColor"${$.attr('d', siMatrix.path)}></path>`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		IconButton($$renderer, {
			href: 'https://discord.gg/aFzmkrmg9P',
			style: 'color: var(--mdc-on-surface);',
			title: 'Join the Discord Server',
			children: ($$renderer) => {
				Icon($$renderer, {
					tag: 'svg',
					viewBox: '0 0 24 24',
					children: ($$renderer) => {
						$$renderer.push(`<path fill="currentColor"${$.attr('d', siDiscord.path)}></path>`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		IconButton($$renderer, {
			href: 'https://port87.social/@hperrin',
			style: 'color: var(--mdc-on-surface);',
			title: 'Hunter Perrin (SMUI Author) on Mastodon',
			children: ($$renderer) => {
				Icon($$renderer, {
					tag: 'svg',
					viewBox: '0 0 24 24',
					children: ($$renderer) => {
						$$renderer.push(`<path fill="currentColor"${$.attr('d', siMastodon.path)}></path>`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <h4 class="mdc-typography--headline6">Made with ❤️ by <a style="color: var(--mdc-on-surface);" href="https://port87.com/" target="_blank">Port87 Email</a></h4></div> <div class="features-list svelte-176j5ii">`);

		Paper($$renderer, {
			variant: 'outlined',
			color: 'primary',
			children: ($$renderer) => {
				$$renderer.push(`<div style="width: 40px;">`);

				Icon($$renderer, {
					tag: 'svg',
					style: 'width: 40px; height: 40px;',
					viewBox: '0 0 24 24',
					children: ($$renderer) => {
						$$renderer.push(`<path fill="currentColor"${$.attr('d', mdiLanguageTypescript)}></path>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div style="flex-grow: 1;">`);

				Title($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Fully, Strictly Typed`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Content($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->SMUI is strictly typed with TypeScript. This not only helps catch
            bugs early, it helps while developing as every property is
            autocompleted by modern IDEs.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Paper($$renderer, {
			variant: 'outlined',
			color: 'secondary',
			children: ($$renderer) => {
				$$renderer.push(`<div style="width: 40px;">`);

				Icon($$renderer, {
					tag: 'svg',
					style: 'width: 40px; height: 40px;',
					viewBox: '0 0 24 24',
					children: ($$renderer) => {
						$$renderer.push(`<path fill="currentColor"${$.attr('d', mdiHuman)}></path>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div style="flex-grow: 1;">`);

				Title($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Accessible by Default`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Content($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->SMUI automatically adds appropriate ARIA attributes to components to
            provide accessibility to screen readers. SMUI is also fully keyboard
            accessible, meaning motor impaired users can easily use SMUI
            components.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Paper($$renderer, {
			variant: 'outlined',
			color: 'primary',
			children: ($$renderer) => {
				$$renderer.push(`<div style="width: 40px;">`);

				Icon($$renderer, {
					tag: 'svg',
					style: 'width: 40px; height: 40px;',
					viewBox: '0 0 24 24',
					children: ($$renderer) => {
						$$renderer.push(`<path fill="currentColor"${$.attr('d', mdiGestureTap)}></path>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div style="flex-grow: 1;">`);

				Title($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Touch Friendly`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Content($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->SMUI provides increased touch targets to allow ease of use on mobile
            devices, conforming to the Material Spec requirement of minimum 48px
            x 48px touch targets.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Paper($$renderer, {
			variant: 'outlined',
			color: 'secondary',
			children: ($$renderer) => {
				$$renderer.push(`<div style="width: 40px;">`);

				Icon($$renderer, {
					tag: 'svg',
					style: 'width: 40px; height: 40px;',
					viewBox: '0 0 24 24',
					children: ($$renderer) => {
						$$renderer.push(`<path fill="currentColor"${$.attr('d', mdiMonitorScreenshot)}></path>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div style="flex-grow: 1;">`);

				Title($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Server Side Rendering`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Content($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->SMUI can be fully rendered on the server, meaning faster time to
            first meaningful paint. SMUI fully supports SvelteKit. In fact, the
            site you're looking at is a SvelteKit app.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Paper($$renderer, {
			variant: 'outlined',
			color: 'primary',
			children: ($$renderer) => {
				$$renderer.push(`<div style="width: 40px;">`);

				Icon($$renderer, {
					tag: 'svg',
					style: 'width: 40px; height: 40px;',
					viewBox: '0 0 24 24',
					children: ($$renderer) => {
						$$renderer.push(`<path fill="currentColor"${$.attr('d', mdiPalette)}></path>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div style="flex-grow: 1;">`);

				Title($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Fully Themable`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Content($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Components are themable using Sass variables. Everything from their
            shape, color, density, borders, interaction states, and more is
            themable.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Paper($$renderer, {
			variant: 'outlined',
			color: 'secondary',
			children: ($$renderer) => {
				$$renderer.push(`<div style="width: 40px;">`);

				Icon($$renderer, {
					tag: 'svg',
					style: 'width: 40px; height: 40px;',
					viewBox: '0 0 24 24',
					children: ($$renderer) => {
						$$renderer.push(`<path fill="currentColor"${$.attr('d', mdiCommentArrowLeft)}></path>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div style="flex-grow: 1;">`);

				Title($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->RTL/Internationalization Support`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Content($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->SMUI is RTL aware, and components will adapt their design to suit
            the language of the user.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Paper($$renderer, {
			variant: 'outlined',
			color: 'primary',
			children: ($$renderer) => {
				$$renderer.push(`<div style="width: 40px;">`);

				Icon($$renderer, {
					tag: 'svg',
					style: 'width: 40px; height: 40px;',
					viewBox: '0 0 24 24',
					children: ($$renderer) => {
						$$renderer.push(`<path fill="currentColor"${$.attr('d', mdiAccountGroup)}></path>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div style="flex-grow: 1;">`);

				Title($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Widely Used, a Growing Community`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Content($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->With over <a href="https://github.com/hperrin/svelte-material-ui/network/dependents?package_id=UGFja2FnZS01NTM5MDg5MDQ" target="_blank">3,000 projects</a> using SMUI components, it is the most popular Svelte UI library. For
            good reason, too. It is the most versatile and adaptable Svelte UI library,
            guaranteed.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Paper($$renderer, {
			variant: 'outlined',
			color: 'secondary',
			children: ($$renderer) => {
				$$renderer.push(`<div style="width: 40px;">`);

				Icon($$renderer, {
					tag: 'svg',
					style: 'width: 40px; height: 40px;',
					viewBox: '0 0 24 24',
					children: ($$renderer) => {
						$$renderer.push(`<path fill="currentColor"${$.attr('d', mdiRotateRightVariant)}></path>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div style="flex-grow: 1;">`);

				Title($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Adaptable, Versatile`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Content($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->SMUI supports adding arbitrary attributes and actions to every
            component and many internal elements within them. SMUI forwards all
            events from every component, and supports event modifiers, including
            passive. SMUI works in the Svelte REPL, meaning you can <a href="https://svelte.dev/repl/aa857c3bb5eb478cbe6b1fd6c6da522a" target="_blank">play with it right now</a>.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Paper($$renderer, {
			variant: 'outlined',
			color: 'primary',
			children: ($$renderer) => {
				$$renderer.push(`<div style="width: 40px;">`);

				Icon($$renderer, {
					tag: 'svg',
					style: 'width: 40px; height: 40px;',
					viewBox: '0 0 24 24',
					children: ($$renderer) => {
						$$renderer.push(`<path fill="currentColor"${$.attr('d', mdiClipboardCheck)}></path>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div style="flex-grow: 1;">`);

				Title($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Material Design Compliant`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Content($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Every SMUI component fully follows the Material Design
            specification. You can build up-to-spec UIs with SMUI.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div> <div style="margin: 4em 0;"><p>[ <a href="https://matrix.to/#/#smui:matrix.port87.help">Matrix</a> | <a href="https://discord.gg/aFzmkrmg9P">Discord</a> | <a href="https://github.com/hperrin/svelte-material-ui">GitHub</a> | <a href="https://github.com/hperrin/svelte-material-ui/issues">Issue Tracker</a> | © 2019-2026 Hunter Perrin ]</p></div></section>`);
	});
}