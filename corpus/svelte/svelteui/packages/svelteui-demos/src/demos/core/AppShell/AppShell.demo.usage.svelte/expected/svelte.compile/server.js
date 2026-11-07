import * as $ from 'svelte/internal/server';
import { fns, AppShell, Navbar, Header, ShellSection } from '@svelteuidev/core';
import HeadContent from './_HeadContent.svelte';
import NavContent from './_NavContent.svelte';

const code = `
<script>
	import { fns, AppShell, Navbar, Header, Title, Divider } from '@svelteuidev/core';
	import HeadContent from './HeadContent.svelte';
	import NavContent from './NavContent.svelte';

	let isDark = false;
	let opened = false;

	function toggleTheme() {
		isDark = !isDark;
	}
	function toggleOpened() {
		opened = !opened;
	}
<\/script>

<AppShell>
	<Navbar slot="navbar" hidden={!opened}>
		<NavContent />
	</Navbar>
	<Header slot="header">
		<HeadContent />
	</Header>

	<slot>This is the main content</slot>
</AppShell>
`;

export const type = 'demo';
export const configuration = { code, spacing: false };

export default function AppShell_demo_usage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// @ts-ignore
		let isDark = false;

		let opened = false;

		function toggleTheme() {
			isDark = !isDark;
		}

		function toggleOpened() {
			opened = !opened;
		}

		AppShell($$renderer, {
			fixed: false,
			override: {
				main: {
					bc: isDark ? fns.themeColor('dark', 8) : fns.themeColor('gray', 0),
					color: isDark ? fns.themeColor('dark', 0) : 'black',
					ml: '0px !important'
				}
			},

			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				$.slot($$renderer, $$props, 'default', {}, () => {
					$$renderer.push(`This is the main content`);
				});

				$$renderer.push(`<!--]-->`);
			},

			$$slots: {
				default: true,
				navbar: ($$renderer) => {
					Navbar($$renderer, {
						slot: 'navbar',
						hidden: !opened,
						hiddenBreakpoint: 'sm',
						width: { base: '100%', sm: 300 },
						height: 500,
						fixed: false,
						override: { p: '$xsPX', bc: isDark ? fns.themeColor('dark', 7) : 'white' },
						children: ($$renderer) => {
							ShellSection($$renderer, {
								grow: true,
								children: ($$renderer) => {
									NavContent($$renderer, { isDark });
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},

				header: ($$renderer) => {
					Header($$renderer, {
						slot: 'header',
						height: 60,
						override: { p: '$mdPX', bc: isDark ? fns.themeColor('dark', 7) : 'white' },
						children: ($$renderer) => {
							HeadContent($$renderer, {
								isDark,
								opened,
								toggle: toggleTheme,
								toggleOpen: toggleOpened
							});
						},
						$$slots: { default: true }
					});
				}
			}
		});
	});
}