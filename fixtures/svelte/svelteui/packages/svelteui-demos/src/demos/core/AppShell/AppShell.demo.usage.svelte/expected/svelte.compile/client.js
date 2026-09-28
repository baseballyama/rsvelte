import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function AppShell_demo_usage($$anchor, $$props) {
	$.push($$props, true);

	// @ts-ignore
	let isDark = false;

	let opened = false;

	function toggleTheme() {
		isDark = !isDark;
	}

	function toggleOpened() {
		opened = !opened;
	}

	{
		let $0 = $.derived(() => ({
			main: {
				bc: isDark ? fns.themeColor('dark', 8) : fns.themeColor('gray', 0),
				color: isDark ? fns.themeColor('dark', 0) : 'black',
				ml: '0px !important'
			}
		}));

		AppShell($$anchor, {
			fixed: false,
			get override() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.slot(node, $$props, 'default', {}, ($$anchor) => {
					var text = $.text('This is the main content');

					$.append($$anchor, text);
				});

				$.append($$anchor, fragment_1);
			},

			$$slots: {
				default: true,
				navbar: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => !opened);
						let $1 = $.derived(() => ({ p: '$xsPX', bc: isDark ? fns.themeColor('dark', 7) : 'white' }));

						Navbar($$anchor, {
							slot: 'navbar',
							get hidden() {
								return $.get($0);
							},
							hiddenBreakpoint: 'sm',
							width: { base: '100%', sm: 300 },
							height: 500,
							fixed: false,
							get override() {
								return $.get($1);
							},

							children: ($$anchor, $$slotProps) => {
								ShellSection($$anchor, {
									grow: true,
									children: ($$anchor, $$slotProps) => {
										NavContent($$anchor, {
											get isDark() {
												return isDark;
											}
										});
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					}
				},

				header: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => ({ p: '$mdPX', bc: isDark ? fns.themeColor('dark', 7) : 'white' }));

						Header($$anchor, {
							slot: 'header',
							height: 60,
							get override() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								HeadContent($$anchor, {
									get isDark() {
										return isDark;
									},

									get opened() {
										return opened;
									},
									toggle: toggleTheme,
									toggleOpen: toggleOpened
								});
							},
							$$slots: { default: true }
						});
					}
				}
			}
		});
	}

	$.pop();
}