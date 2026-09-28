import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import Icon from '$lib/components/Icon.svelte';
import { Save } from '@lucide/svelte';
import { uiStore } from '$lib/ui.svelte';
import MainLayout from './layout/MainLayout.svelte';
import Header from './layout/Header.svelte';
import ActionBar from './nodes/shared/ActionBar.svelte';
import snippetIcon from '$lib/assets/snippets-package-1616x16@2x.png?inline';

var root = $.from_html(`<div class="flex items-center gap-3 !pl-2.5"><!> <h1 class="text-lg font-medium">Create Snippet</h1></div>`);
var root_1 = $.from_html(`<span> </span>`);
var root_2 = $.from_html(`<p class="text-center text-red-500"> </p>`);
var root_3 = $.from_html(`<div class="grow overflow-y-auto p-6"><div class="mx-auto max-w-xl space-y-6"><div class="grid grid-cols-[120px_1fr] items-center gap-4"><label for="name" class="text-right text-sm text-gray-400">Name</label> <!></div> <div class="grid grid-cols-[120px_1fr] items-center gap-4"><label for="keyword" class="text-right text-sm text-gray-400">Keyword</label> <!></div> <div class="grid grid-cols-[120px_1fr] items-start gap-4"><label for="content" class="pt-2 text-right text-sm text-gray-400">Snippet</label> <div class="grid w-full"><div aria-hidden="true" class="pointer-events-none col-start-1 row-start-1 min-h-32 w-full rounded-md border-transparent bg-transparent px-3 py-2 font-mono text-sm break-words whitespace-pre-wrap"><!> <span>​</span></div> <!></div></div> <!></div></div>`);
var root_4 = $.from_html(`<!> Create Snippet`, 1);

export default function SnippetForm($$anchor, $$props) {
	$.push($$props, true);

	let name = $.state('');
	let keyword = $.state('');
	let snippetContent = $.state('');
	let error = $.state('');
	const PLACEHOLDER_REGEX = /\{(?<name>\w+)(?<attributes>(?:\s+\w+=(?:"[^"]*"|\S+))*)?(?<modifiers>(?:\s*\|\s*[\w%-]+)*)\}/g;

	const VALID_PLACEHOLDERS = new Set([
		'clipboard',
		'snippet',
		'cursor',
		'date',
		'time',
		'datetime',
		'day',
		'uuid'
	]);

	const VALID_MODIFIERS = new Set([
		'uppercase',
		'lowercase',
		'trim',
		'percent-encode',
		'json-stringify'
	]);

	const VALID_ATTRIBUTES = {
		clipboard: new Set(['offset']),
		snippet: new Set(['name']),
		date: new Set(['offset', 'format']),
		time: new Set(['offset', 'format']),
		datetime: new Set(['offset', 'format']),
		day: new Set(['offset', 'format'])
	};

	const ATTRIBUTE_REGEX = /\s*(?<key>\w+)\s*=\s*"(?:[^"]*)"/g;

	function parseAttributes(attrStr) {
		if (!attrStr) return {};

		const attributes = {};

		for (const match of attrStr.matchAll(ATTRIBUTE_REGEX)) {
			if (match.groups) {
				attributes[match.groups.key] = 'dummy';
			}
		}

		return attributes;
	}

	function parseModifiers(modStr) {
		if (!modStr) return [];

		return modStr.split('|').map((s) => s.trim()).filter(Boolean);
	}

	function validatePlaceholder(name, attributes, modifiers) {
		if (!VALID_PLACEHOLDERS.has(name)) return false;

		const validAttrsForPlaceholder = VALID_ATTRIBUTES[name] || new Set();

		for (const attrName in attributes) {
			if (!validAttrsForPlaceholder.has(attrName)) return false;
		}

		for (const mod of modifiers) {
			if (!VALID_MODIFIERS.has(mod)) return false;
		}

		return true;
	}

	const parsedContent = $.derived(() => {
		if (!$.get(snippetContent)) return [];

		const parts = [];
		let lastIndex = 0;
		let cursorCount = 0;

		for (const match of $.get(snippetContent).matchAll(PLACEHOLDER_REGEX)) {
			if (match.index > lastIndex) {
				parts.push({
					text: $.get(snippetContent).substring(lastIndex, match.index),
					type: 'text'
				});
			}

			const placeholderName = match.groups.name;
			const attributes = parseAttributes(match.groups.attributes);
			const modifiers = parseModifiers(match.groups.modifiers);
			let isValid = validatePlaceholder(placeholderName, attributes, modifiers);

			if (placeholderName === 'cursor') {
				cursorCount++;

				if (cursorCount > 1) {
					isValid = false;
				}
			}

			const bracketType = isValid ? 'valid-bracket' : 'invalid-bracket';
			const nameType = isValid ? 'valid-name' : 'invalid-name';

			parts.push({ text: '{', type: bracketType });
			parts.push({ text: match[0].slice(1, -1), type: nameType });
			parts.push({ text: '}', type: bracketType });
			lastIndex = match.index + match[0].length;
		}

		if (lastIndex < $.get(snippetContent).length) {
			parts.push({
				text: $.get(snippetContent).substring(lastIndex),
				type: 'text'
			});
		}

		return parts;
	});

	async function handleSave() {
		if (!$.get(name).trim() || !$.get(keyword).trim() || !$.get(snippetContent).trim()) {
			$.set(error, 'All fields are required.');

			return;
		}

		$.set(error, '');

		try {
			await invoke('create_snippet', {
				name: $.get(name),
				keyword: $.get(keyword),
				content: $.get(snippetContent)
			});

			uiStore.toasts.set(Date.now(), { id: Date.now(), title: 'Snippet Created', style: 'SUCCESS' });
			$$props.onSave();
		} catch(e) {
			const errorMessage = e instanceof Error ? e.message : String(e);

			$.set(error, errorMessage, true);
			console.error('Failed to create snippet:', e);
		}
	}

	{
		const header = ($$anchor) => {
			Header($$anchor, {
				showBackButton: true,
				get onPopView() {
					return $$props.onBack;
				},

				children: ($$anchor, $$slotProps) => {
					var div = root();
					var node = $.child(div);

					Icon(node, { icon: 'snippets-16', class: 'size-6' });
					$.next(2);
					$.reset(div);
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});
		};

		const content = ($$anchor) => {
			var div_1 = root_3();
			var div_2 = $.child(div_1);
			var div_3 = $.child(div_2);
			var node_1 = $.sibling($.child(div_3), 2);

			Input(node_1, {
				id: 'name',
				placeholder: 'Snippet name',
				get value() {
					return $.get(name);
				},

				set value($$value) {
					$.set(name, $$value, true);
				}
			});

			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var node_2 = $.sibling($.child(div_4), 2);

			Input(node_2, {
				id: 'keyword',
				placeholder: '!email',
				get value() {
					return $.get(keyword);
				},

				set value($$value) {
					$.set(keyword, $$value, true);
				}
			});

			$.reset(div_4);

			var div_5 = $.sibling(div_4, 2);
			var div_6 = $.sibling($.child(div_5), 2);
			var div_7 = $.child(div_6);
			var node_3 = $.child(div_7);

			$.each(node_3, 17, () => $.get(parsedContent), $.index, ($$anchor, part) => {
				var span = root_1();
				let classes;
				var text = $.only_child(span, true);

				$.template_effect(() => {
					classes = $.set_class(span, 1, '', null, classes, {
						'text-blue-400': $.get(part).type === 'valid-bracket',
						'text-red-400': $.get(part).type === 'invalid-bracket' || $.get(part).type === 'invalid-name',
						'text-foreground': $.get(part).type === 'text' || $.get(part).type === 'valid-name'
					});

					$.set_text(text, $.get(part).text);
				});

				$.append($$anchor, span);
			});

			$.next(2);
			$.reset(div_7);

			var node_4 = $.sibling(div_7, 2);

			Textarea(node_4, {
				id: 'content',
				placeholder: 'Enter your snippet content... e.g. Hello {clipboard | uppercase}!',
				class: 'caret-foreground col-start-1 row-start-1 min-h-32 resize-none !bg-transparent font-mono text-transparent',
				spellcheck: false,
				get value() {
					return $.get(snippetContent);
				},

				set value($$value) {
					$.set(snippetContent, $$value, true);
				}
			});

			$.reset(div_6);
			$.reset(div_5);

			var node_5 = $.sibling(div_5, 2);

			{
				var consequent = ($$anchor) => {
					var p = root_2();
					var text_1 = $.only_child(p, true);

					$.template_effect(() => $.set_text(text_1, $.get(error)));
					$.append($$anchor, p);
				};

				$.if(node_5, ($$render) => {
					if ($.get(error)) $$render(consequent);
				});
			}

			$.reset(div_2);
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		const footer = ($$anchor) => {
			{
				const primaryAction = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props(props, {
						onclick: handleSave,
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_4();
							var node_6 = $.first_child(fragment_4);

							Save(node_6, { class: 'mr-2 size-4' });
							$.next();
							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					}));
				};

				ActionBar($$anchor, {
					actions: [
						{
							title: 'Create Snippet',
							handler: handleSave,
							shortcut: { key: 'enter', modifiers: ['cmd'] }
						}
					],

					get icon() {
						return snippetIcon;
					},
					title: 'Create Snippet',
					primaryAction,
					$$slots: { primaryAction: true }
				});
			}
		};

		MainLayout($$anchor, {
			header,
			content,
			footer,
			$$slots: { header: true, content: true, footer: true }
		});
	}

	$.pop();
}