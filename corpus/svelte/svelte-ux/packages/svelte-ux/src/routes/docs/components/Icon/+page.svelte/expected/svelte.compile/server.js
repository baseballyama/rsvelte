import * as $ from 'svelte/internal/server';

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

export default function _page($$renderer) {
	$.head('h6y0j9', $$renderer, ($$renderer) => {
		$$renderer.push(`<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:FILL@0..1" rel="stylesheet"/>`);
	});

	$$renderer.push(`<h1>Examples</h1> <div class="grid grid-cols-[1fr,auto] items-center gap-2"><h2>Material Design icons</h2> `);

	ButtonGroup($$renderer, {
		variant: 'fill-light',
		color: 'primary',
		size: 'sm',
		children: ($$renderer) => {
			Button($$renderer, {
				href: 'https://pictogrammers.com/library/mdi/',
				target: '_blank',
				class: 'flex-row-reverse',
				icon: mdiOpenInNew,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Icons`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Icon($$renderer, { data: mdiAccount });
			$$renderer.push(`<!----> `);

			Icon($$renderer, {
				svg: '<svg width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4Z"/></svg>'
			});

			$$renderer.push(`<!----> `);
			Icon($$renderer, { svgUrl: 'https://api.iconify.design/mdi:account.svg' });
			$$renderer.push(`<!----> `);

			Icon($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<svg width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4Z"></path></svg>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="grid grid-cols-[1fr,auto] items-center gap-2"><h2>Font Awesome icons</h2> `);

	ButtonGroup($$renderer, {
		variant: 'fill-light',
		color: 'primary',
		size: 'sm',
		children: ($$renderer) => {
			Button($$renderer, {
				href: 'https://fontawesome.com/icons',
				target: '_blank',
				class: 'flex-row-reverse',
				icon: mdiOpenInNew,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Icons`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Icon($$renderer, { data: faUser });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="grid grid-cols-[1fr,auto] items-center gap-2"><h2>Material Symbols font</h2> `);

	ButtonGroup($$renderer, {
		variant: 'fill-light',
		color: 'primary',
		size: 'sm',
		children: ($$renderer) => {
			Button($$renderer, {
				href: 'https://fonts.google.com/icons',
				target: '_blank',
				class: 'flex-row-reverse',
				icon: mdiOpenInNew,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Icons`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				href: 'https://developers.google.com/fonts/docs/material_symbols',
				target: '_blank',
				class: 'flex-row-reverse',
				icon: mdiOpenInNew,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Docs`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Icon($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<span class="material-symbols-outlined">person</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Icon($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1">person</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Sizes</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Icon($$renderer, { data: mdiAccount, size: '8px' });
			$$renderer.push(`<!----> `);
			Icon($$renderer, { data: mdiAccount, size: '1em' });
			$$renderer.push(`<!----> `);
			Icon($$renderer, { data: mdiAccount, size: '1.5em' });
			$$renderer.push(`<!----> `);
			Icon($$renderer, { data: mdiAccount, size: '2em' });
			$$renderer.push(`<!----> `);
			Icon($$renderer, { data: mdiAccount, size: '2.5em' });
			$$renderer.push(`<!----> `);
			Icon($$renderer, { data: mdiAccount, size: '3em' });
			$$renderer.push(`<!----> `);
			Icon($$renderer, { data: mdiAccount, size: '64px' });
			$$renderer.push(`<!----> `);

			Icon($$renderer, {
				svgUrl: 'https://api.iconify.design/mdi:account.svg',
				size: '64px'
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Color</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Icon($$renderer, { data: mdiAccount, class: 'text-danger' });
			$$renderer.push(`<!----> `);
			Icon($$renderer, { data: mdiAccount, class: 'text-primary' });
			$$renderer.push(`<!----> `);
			Icon($$renderer, { data: mdiAccount, class: 'text-success' });
			$$renderer.push(`<!----> `);
			Icon($$renderer, { data: mdiAccount, class: 'text-surface-content/50' });
			$$renderer.push(`<!----> `);

			Icon($$renderer, {
				svgUrl: 'https://api.iconify.design/mdi:account.svg',
				class: 'text-danger'
			});

			$$renderer.push(`<!----> `);

			Icon($$renderer, {
				svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/></svg>',
				class: 'fill-primary'
			});

			$$renderer.push(`<!----> `);

			Icon($$renderer, {
				svgUrl: 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/user.svg',
				class: 'text-success'
			});

			$$renderer.push(`<!----> `);
			Icon($$renderer, { data: mdiAccount, style: 'color:red' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Multiple paths</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Icon($$renderer, {
				path: [mdiDecagramOutline, mdiCheck],
				classes: { path: ['', 'text-primary scale-50 origin-center'] }
			});

			$$renderer.push(`<!----> `);

			Icon($$renderer, {
				path: [mdiMenuUp, mdiMenuDown],
				classes: {
					path: ['translate-y-[-4px]', 'translate-y-[4px] text-primary']
				}
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Rotate / Scale / Flip</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Icon($$renderer, { data: mdiArrowRight, class: '-rotate-45' });
			$$renderer.push(`<!----> `);
			Icon($$renderer, { data: mdiArrowRight, class: 'scale-75' });
			$$renderer.push(`<!----> `);
			Icon($$renderer, { data: mdiArrowRight, class: '-scale-x-100' });
			$$renderer.push(`<!----> `);
			Icon($$renderer, { data: mdiAccount, class: '-scale-y-100' });
			$$renderer.push(`<!----> `);

			Icon($$renderer, {
				svgUrl: 'https://api.iconify.design/mdi:account.svg',
				class: '-scale-y-100'
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Animation</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Icon($$renderer, { data: mdiLoading, class: 'animate-spin' });
			$$renderer.push(`<!----> `);
			Icon($$renderer, { data: mdiHeart, class: 'animate-pulse' });
			$$renderer.push(`<!----> `);
			Icon($$renderer, { data: mdiCircleMedium, class: 'animate-ping' });
			$$renderer.push(`<!----> `);
			Icon($$renderer, { data: mdiDownload, class: 'animate-bounce' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>with Tooltip</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Tooltip($$renderer, {
				title: 'User',
				children: ($$renderer) => {
					Icon($$renderer, { data: mdiAccount });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				title: 'User',
				children: ($$renderer) => {
					Icon($$renderer, { svgUrl: 'https://api.iconify.design/mdi:account.svg' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				title: 'User',
				children: ($$renderer) => {
					Icon($$renderer, {
						svg: '<svg width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4Z"/></svg>'
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				title: 'User',
				children: ($$renderer) => {
					Icon($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<svg width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4Z"></path></svg>`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}