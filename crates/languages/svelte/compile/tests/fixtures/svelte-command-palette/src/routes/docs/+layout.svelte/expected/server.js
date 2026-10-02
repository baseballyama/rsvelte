import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import Sidebar from '../../components/Sidebar.svelte';
import CommandPalette, { defineActions, createStoreMethods } from '$lib';

import {
	BookOpen,
	Zap,
	FileCode,
	Target,
	Database,
	Paintbrush,
	Moon,
	Keyboard,
	Puzzle,
	Home,
	Github
} from 'lucide-svelte';

function bookOpenIcon($$renderer) {
	BookOpen($$renderer, { size: 18 });
}

function zapIcon($$renderer) {
	Zap($$renderer, { size: 18 });
}

function fileCodeIcon($$renderer) {
	FileCode($$renderer, { size: 18 });
}

function targetIcon($$renderer) {
	Target($$renderer, { size: 18 });
}

function databaseIcon($$renderer) {
	Database($$renderer, { size: 18 });
}

function paintbrushIcon($$renderer) {
	Paintbrush($$renderer, { size: 18 });
}

function moonIcon($$renderer) {
	Moon($$renderer, { size: 18 });
}

function keyboardIcon($$renderer) {
	Keyboard($$renderer, { size: 18 });
}

function puzzleIcon($$renderer) {
	Puzzle($$renderer, { size: 18 });
}

function homeIcon($$renderer) {
	Home($$renderer, { size: 18 });
}

function githubIcon($$renderer) {
	Github($$renderer, { size: 18 });
}

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		const paletteMethods = createStoreMethods();

		CommandPalette($$renderer, {
			commands: defineActions([
				{
					title: 'Getting Started',
					subTitle: 'Installation and quick start guide',
					icon: bookOpenIcon,
					group: 'Documentation',
					onRun: () => goto('/docs/installation'),
					shortcut: 'G I'
				},

				{
					title: 'Quick Start',
					subTitle: 'Get up and running in 5 minutes',
					icon: zapIcon,
					group: 'Documentation',
					onRun: () => goto('/docs/quick-start'),
					shortcut: 'G Q'
				},

				{
					title: 'Command Palette API',
					subTitle: 'Component props and configuration',
					icon: fileCodeIcon,
					group: 'API Reference',
					onRun: () => goto('/docs/command-palette-api'),
					shortcut: 'G A'
				},

				{
					title: 'Define Actions',
					subTitle: 'Creating and configuring actions',
					icon: targetIcon,
					group: 'API Reference',
					onRun: () => goto('/docs/define-actions')
				},

				{
					title: 'Palette Store',
					subTitle: 'Store methods and state management',
					icon: databaseIcon,
					group: 'API Reference',
					onRun: () => goto('/docs/palette-store')
				},

				{
					title: 'Styling',
					subTitle: 'Customize the look and feel',
					icon: paintbrushIcon,
					group: 'Customization',
					onRun: () => goto('/docs/styling'),
					shortcut: 'G S'
				},

				{
					title: 'Theming',
					subTitle: 'Light and dark mode support',
					icon: moonIcon,
					group: 'Customization',
					onRun: () => goto('/docs/theming')
				},

				{
					title: 'Keyboard Shortcuts',
					subTitle: 'Configure keyboard bindings',
					icon: keyboardIcon,
					group: 'Customization',
					onRun: () => goto('/docs/shortcuts')
				},

				{
					title: 'Custom Components',
					subTitle: 'Icons, groups, and empty states',
					icon: puzzleIcon,
					group: 'Customization',
					onRun: () => goto('/docs/custom-components')
				},

				{
					title: 'Go to Homepage',
					subTitle: 'Return to the main page',
					icon: homeIcon,
					group: 'Navigation',
					onRun: () => goto('/'),
					shortcut: 'G H'
				},

				{
					title: 'View on GitHub',
					subTitle: 'Check out the source code',
					icon: githubIcon,
					group: 'Navigation',
					onRun: () => window.open('https://github.com/rohitpotato/svelte-command-palette', '_blank')
				}
			]),
			placeholder: 'Search documentation...',
			shortcut: '$mod+k'
		});

		$$renderer.push(`<!----> <div class="docs-layout svelte-1bpnej">`);
		Sidebar($$renderer, {});
		$$renderer.push(`<!----> <main class="docs-main svelte-1bpnej"><article class="docs-content svelte-1bpnej">`);
		children($$renderer);
		$$renderer.push(`<!----></article></main></div>`);
	});
}