import * as $ from 'svelte/internal/server';
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

export default function AppShell_demo_responsive($$renderer) {
	Text($$renderer, {
		weight: 'bold',
		align: 'center',
		tracking: 'tight',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Click the toggle to see `);
			ArrowRight($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}