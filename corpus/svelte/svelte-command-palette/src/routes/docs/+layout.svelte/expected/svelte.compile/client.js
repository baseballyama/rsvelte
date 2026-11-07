import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

const bookOpenIcon = ($$anchor) => {
	BookOpen($$anchor, { size: 18 });
};

const zapIcon = ($$anchor) => {
	Zap($$anchor, { size: 18 });
};

const fileCodeIcon = ($$anchor) => {
	FileCode($$anchor, { size: 18 });
};

const targetIcon = ($$anchor) => {
	Target($$anchor, { size: 18 });
};

const databaseIcon = ($$anchor) => {
	Database($$anchor, { size: 18 });
};

const paintbrushIcon = ($$anchor) => {
	Paintbrush($$anchor, { size: 18 });
};

const moonIcon = ($$anchor) => {
	Moon($$anchor, { size: 18 });
};

const keyboardIcon = ($$anchor) => {
	Keyboard($$anchor, { size: 18 });
};

const puzzleIcon = ($$anchor) => {
	Puzzle($$anchor, { size: 18 });
};

const homeIcon = ($$anchor) => {
	Home($$anchor, { size: 18 });
};

const githubIcon = ($$anchor) => {
	Github($$anchor, { size: 18 });
};

var root = $.from_html(`<!> <div class="docs-layout svelte-1bpnej"><!> <main class="docs-main svelte-1bpnej"><article class="docs-content svelte-1bpnej"><!></article></main></div>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const paletteMethods = createStoreMethods();
	var fragment_11 = root();
	var node = $.first_child(fragment_11);

	{
		let $0 = $.derived(() => defineActions([
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
		]));

		CommandPalette(node, {
			get commands() {
				return $.get($0);
			},
			placeholder: 'Search documentation...',
			shortcut: '$mod+k'
		});
	}

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Sidebar(node_1, {});

	var main = $.sibling(node_1, 2);
	var article = $.child(main);
	var node_2 = $.child(article);

	$.snippet(node_2, () => $$props.children);
	$.reset(article);
	$.reset(main);
	$.reset(div);
	$.append($$anchor, fragment_11);
	$.pop();
}