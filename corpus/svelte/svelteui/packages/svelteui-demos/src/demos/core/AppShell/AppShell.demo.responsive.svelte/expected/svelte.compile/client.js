import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Text } from '@svelteuidev/core';
import { ArrowRight } from 'radix-icons-svelte';

const code = `
<script>
	import { fns, AppShell, Navbar, Header, Aside, Footer, ShellSection } from '@svelteuidev/core';
<\/script>

<AppShell
	fixed
	navbarOffsetBreakpoint="sm"
	asideOffsetBreakpoint="sm"
>
	<Navbar slot="navbar" hidden={!opened} fixed>
		<NavbarContent />
	</Navbar>

	<Header fixed slot="header">
		<HeaderContent />
	</Header>

	<!-- Main content uses the default slot, so no need to explicitly declare it -->
	<ShellSection grow>
		<MainContent />
	</ShellSection>

	<Aside slot="aside">
		<AsideContent />
	</Aside>

	<Footer slot="footer">
		<FooterContent />
	</Footer>
</AppShell>
`;

export const type = 'demo';
export const configuration = { code, toggle: true };

var root = $.from_html(`Click the toggle to see <!>`, 1);

export default function AppShell_demo_responsive($$anchor) {
	Text($$anchor, {
		weight: 'bold',
		align: 'center',
		tracking: 'tight',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node = $.sibling($.first_child(fragment_1));

			ArrowRight(node, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}