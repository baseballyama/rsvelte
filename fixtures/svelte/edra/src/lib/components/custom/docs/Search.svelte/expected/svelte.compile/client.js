import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Command from '$lib/components/ui/command/index.js';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

import {
	BookOpen,
	Download,
	Rocket,
	Table,
	ListTodo,
	Type,
	Calculator,
	BookMarked,
	FileImage,
	Megaphone,
	Move,
	CodeXml,
	Sparkles,
	Terminal,
	Globe,
	SlidersHorizontal,
	Settings,
	ListOrdered,
	Database,
	Users
} from '@lucide/svelte';

let open = $.state(false);

export const openSearch = () => {
	$.set(open, true);
};

var root = $.from_html(`<!> <span> </span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Search($$anchor, $$props) {
	$.push($$props, true);

	function handleKeydown(e) {
		if ((e.key === 'j' || e.key === 'k') && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			$.set(open, !$.get(open));
		}
	}

	const searchItems = [
		{
			title: 'Introduction',
			url: resolve('/docs'),
			keywords: ['intro', 'welcome', 'overview', 'readme', 'about', 'edra'],
			icon: BookOpen,
			group: 'Getting Started'
		},

		{
			title: 'Installation',
			url: resolve('/docs/installation'),
			keywords: ['install', 'setup', 'npm', 'pnpm', 'bun', 'add', 'package'],
			icon: Download,
			group: 'Getting Started'
		},

		{
			title: 'Configuration & API',
			url: resolve('/docs/configuration'),
			keywords: [
				'config',
				'setup',
				'api',
				'props',
				'onFileUpload',
				'createEditor',
				'init'
			],
			icon: Settings,
			group: 'Getting Started'
		},

		{
			title: 'Data & Serialization',
			url: resolve('/docs/usages/serialization'),
			keywords: [
				'json',
				'html',
				'markdown',
				'extract',
				'save',
				'load',
				'content',
				'data'
			],
			icon: Database,
			group: 'Getting Started'
		},

		{
			title: 'Starter Kit Extension',
			url: resolve('/docs/extensions/starter-kit'),
			keywords: ['extensions', 'starter', 'kit', 'basic', 'default', 'core'],
			icon: Rocket,
			group: 'Extensions & Plugins'
		},

		{
			title: 'Tables Extension',
			url: resolve('/docs/extensions/tables'),
			keywords: ['table', 'column', 'row', 'grid', 'data', 'grip'],
			icon: Table,
			group: 'Extensions & Plugins'
		},

		{
			title: 'Task List Extension',
			url: resolve('/docs/extensions/tasks'),
			keywords: ['task', 'todo', 'list', 'checkbox', 'done', 'checklist'],
			icon: ListTodo,
			group: 'Extensions & Plugins'
		},

		{
			title: 'Table of Contents',
			url: resolve('/docs/extensions/table-of-contents'),
			keywords: [
				'toc',
				'outline',
				'sidebar',
				'headings',
				'navigation',
				'scroll',
				'spy'
			],
			icon: ListOrdered,
			group: 'Extensions & Plugins'
		},

		{
			title: 'Typography & Colors',
			url: resolve('/docs/extensions/typography-and-colors'),
			keywords: [
				'type',
				'heading',
				'color',
				'text',
				'font',
				'highlight',
				'bold',
				'italic'
			],
			icon: Type,
			group: 'Extensions & Plugins'
		},

		{
			title: 'Mathematics Extension',
			url: resolve('/docs/extensions/mathematics'),
			keywords: [
				'math',
				'katex',
				'latex',
				'equation',
				'formula',
				'block',
				'inline'
			],
			icon: Calculator,
			group: 'Extensions & Plugins'
		},

		{
			title: 'Markdown Extension',
			url: resolve('/docs/extensions/markdown'),
			keywords: [
				'md',
				'markdown',
				'shortcuts',
				'import',
				'export',
				'serialize'
			],
			icon: BookMarked,
			group: 'Extensions & Plugins'
		},

		{
			title: 'Media & Mermaid Extension',
			url: resolve('/docs/extensions/media-and-mermaid'),
			keywords: [
				'image',
				'video',
				'iframe',
				'media',
				'mermaid',
				'chart',
				'diagram',
				'graph'
			],
			icon: FileImage,
			group: 'Extensions & Plugins'
		},

		{
			title: 'Callouts Extension',
			url: resolve('/docs/extensions/callout'),
			keywords: ['callout', 'warning', 'info', 'alert', 'box', 'tip', 'note'],
			icon: Megaphone,
			group: 'Extensions & Plugins'
		},

		{
			title: 'Drag Handle Extension',
			url: resolve('/docs/extensions/drag-handle'),
			keywords: ['drag', 'grip', 'move', 'handle', 'block', 'paragraph'],
			icon: Move,
			group: 'Extensions & Plugins'
		},

		{
			title: 'Codeblock Extension',
			url: resolve('/docs/extensions/code-block'),
			keywords: ['code', 'pre', 'highlight', 'syntax', 'block', 'shiki'],
			icon: CodeXml,
			group: 'Extensions & Plugins'
		},

		{
			title: 'AI Assistant Extension',
			url: resolve('/docs/extensions/ai'),
			keywords: [
				'ai',
				'copilot',
				'writing',
				'improve',
				'assistant',
				'prompt',
				'stream'
			],
			icon: Sparkles,
			group: 'Extensions & Plugins'
		},

		{
			title: 'Slash Command Extension',
			url: resolve('/docs/extensions/slash-command'),
			keywords: ['slash', 'command', 'trigger', 'menu', '/', 'quick'],
			icon: Terminal,
			group: 'Extensions & Plugins'
		},

		{
			title: 'Realtime Collaboration',
			url: resolve('/docs/collaboration'),
			keywords: [
				'collab',
				'realtime',
				'live',
				'hocuspocus',
				'yjs',
				'websocket',
				'provider',
				'caret',
				'awareness',
				'multi',
				'sync'
			],
			icon: Users,
			group: 'Extensions & Plugins'
		},

		{
			title: 'Customizing Extensions',
			url: resolve('/docs/customization'),
			keywords: ['custom', 'config', 'extend', 'options', 'theme', 'settings'],
			icon: SlidersHorizontal,
			group: 'Customization'
		},

		{
			title: 'Typography & Styling',
			url: resolve('/docs/customization/styling'),
			keywords: [
				'type',
				'font',
				'color',
				'style',
				'custom',
				'theme',
				'css',
				'design'
			],
			icon: Type,
			group: 'Customization'
		},

		{
			title: 'Localization & Strings',
			url: resolve('/docs/customization/localization'),
			keywords: [
				'language',
				'i18n',
				'translation',
				'locale',
				'multi',
				'text',
				'strings'
			],
			icon: Globe,
			group: 'Customization'
		},

		{
			title: 'Simple Editor Template',
			url: resolve('/templates/simple'),
			keywords: [
				'simple',
				'focus',
				'minimal',
				'clean',
				'distraction',
				'template',
				'layout'
			],
			icon: BookOpen,
			group: 'Templates'
		},

		{
			title: 'AI Editor Template',
			url: resolve('/templates/ai'),
			keywords: [
				'ai',
				'copilot',
				'assistant',
				'chat',
				'write',
				'prompt',
				'template'
			],
			icon: Sparkles,
			group: 'Templates'
		},

		{
			title: 'Notion Like Template',
			url: resolve('/templates/notion'),
			keywords: [
				'notion',
				'workspace',
				'drag',
				'toc',
				'full',
				'width',
				'cover',
				'template'
			],
			icon: Table,
			group: 'Templates'
		}
	];

	const groups = [
		{
			name: 'Getting Started',
			items: searchItems.filter((item) => item.group === 'Getting Started')
		},

		{
			name: 'Extensions & Plugins',
			items: searchItems.filter((item) => item.group === 'Extensions & Plugins')
		},

		{
			name: 'Customization',
			items: searchItems.filter((item) => item.group === 'Customization')
		},

		{
			name: 'Templates',
			items: searchItems.filter((item) => item.group === 'Templates')
		}
	];

	var fragment = $.comment();

	$.event('keydown', $.document, handleKeydown);

	var node = $.first_child(fragment);

	$.component(node, () => Command.Dialog, ($$anchor, Command_Dialog) => {
		Command_Dialog($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Command.Input, ($$anchor, Command_Input) => {
					Command_Input($$anchor, { placeholder: 'Type a command or search documentation...' });
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Command.List, ($$anchor, Command_List) => {
					Command_List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Command.Empty, ($$anchor, Command_Empty) => {
								Command_Empty($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('No results found.');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.each(node_4, 17, () => groups, (group) => group.name, ($$anchor, group) => {
								var fragment_3 = root_1();
								var node_5 = $.first_child(fragment_3);

								$.component(node_5, () => Command.Group, ($$anchor, Command_Group) => {
									Command_Group($$anchor, {
										get heading() {
											return $.get(group).name;
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_6 = $.first_child(fragment_4);

											$.each(node_6, 17, () => $.get(group).items, (item) => item.title, ($$anchor, item) => {
												var fragment_5 = $.comment();
												var node_7 = $.first_child(fragment_5);

												{
													let $0 = $.derived(() => $.get(item).title);
													let $1 = $.derived(() => $.get(item).keywords.join(' '));

													$.component(node_7, () => Command.Item, ($$anchor, Command_Item) => {
														Command_Item($$anchor, {
															get value() {
																return `${$.get($0) ?? ''} ${$.get($1) ?? ''}`;
															},

															onSelect: () => {
																goto($.get(item).url);
																$.set(open, false);
															},
															class: 'cursor-pointer',
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = root();
																var node_8 = $.first_child(fragment_6);

																$.component(node_8, () => $.get(item).icon, ($$anchor, item_icon) => {
																	item_icon($$anchor, { class: 'me-2 size-4' });
																});

																var span = $.sibling(node_8, 2);
																var text_1 = $.only_child(span, true);

																$.template_effect(() => $.set_text(text_1, $.get(item).title));
																$.append($$anchor, fragment_6);
															},
															$$slots: { default: true }
														});
													});
												}

												$.append($$anchor, fragment_5);
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								var node_9 = $.sibling(node_5, 2);

								$.component(node_9, () => Command.Separator, ($$anchor, Command_Separator) => {
									Command_Separator($$anchor, {});
								});

								$.append($$anchor, fragment_3);
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}