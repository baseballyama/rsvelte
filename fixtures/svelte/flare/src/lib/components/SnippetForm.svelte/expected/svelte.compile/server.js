import * as $ from 'svelte/internal/server';
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

export default function SnippetForm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { onBack, onSave } = $$props;
		let name = '';
		let keyword = '';
		let snippetContent = '';
		let error = '';
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
			if (!snippetContent) return [];

			const parts = [];
			let lastIndex = 0;
			let cursorCount = 0;

			for (const match of snippetContent.matchAll(PLACEHOLDER_REGEX)) {
				if (match.index > lastIndex) {
					parts.push({
						text: snippetContent.substring(lastIndex, match.index),
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

			if (lastIndex < snippetContent.length) {
				parts.push({ text: snippetContent.substring(lastIndex), type: 'text' });
			}

			return parts;
		});

		async function handleSave() {
			if (!name.trim() || !keyword.trim() || !snippetContent.trim()) {
				error = 'All fields are required.';

				return;
			}

			error = '';

			try {
				await invoke('create_snippet', { name, keyword, content: snippetContent });
				uiStore.toasts.set(Date.now(), { id: Date.now(), title: 'Snippet Created', style: 'SUCCESS' });
				onSave();
			} catch(e) {
				const errorMessage = e instanceof Error ? e.message : String(e);

				error = errorMessage;
				console.error('Failed to create snippet:', e);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function header($$renderer) {
					Header($$renderer, {
						showBackButton: true,
						onPopView: onBack,
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex items-center gap-3 !pl-2.5">`);
							Icon($$renderer, { icon: 'snippets-16', class: 'size-6' });
							$$renderer.push(`<!----> <h1 class="text-lg font-medium">Create Snippet</h1></div>`);
						},
						$$slots: { default: true }
					});
				}

				function content($$renderer) {
					$$renderer.push(`<div class="grow overflow-y-auto p-6"><div class="mx-auto max-w-xl space-y-6"><div class="grid grid-cols-[120px_1fr] items-center gap-4"><label for="name" class="text-right text-sm text-gray-400">Name</label> `);

					Input($$renderer, {
						id: 'name',
						placeholder: 'Snippet name',
						get value() {
							return name;
						},

						set value($$value) {
							name = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div> <div class="grid grid-cols-[120px_1fr] items-center gap-4"><label for="keyword" class="text-right text-sm text-gray-400">Keyword</label> `);

					Input($$renderer, {
						id: 'keyword',
						placeholder: '!email',
						get value() {
							return keyword;
						},

						set value($$value) {
							keyword = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div> <div class="grid grid-cols-[120px_1fr] items-start gap-4"><label for="content" class="pt-2 text-right text-sm text-gray-400">Snippet</label> <div class="grid w-full"><div aria-hidden="true" class="pointer-events-none col-start-1 row-start-1 min-h-32 w-full rounded-md border-transparent bg-transparent px-3 py-2 font-mono text-sm break-words whitespace-pre-wrap"><!--[-->`);

					const each_array = $.ensure_array_like(parsedContent());

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let part = each_array[$$index];

						$$renderer.push(`<span${$.attr_class('', void 0, {
							'text-blue-400': part.type === 'valid-bracket',
							'text-red-400': part.type === 'invalid-bracket' || part.type === 'invalid-name',
							'text-foreground': part.type === 'text' || part.type === 'valid-name'
						})}>${$.escape(part.text)}</span>`);
					}

					$$renderer.push(`<!--]--> <span>​</span></div> `);

					Textarea($$renderer, {
						id: 'content',
						placeholder: 'Enter your snippet content... e.g. Hello {clipboard | uppercase}!',
						class: 'caret-foreground col-start-1 row-start-1 min-h-32 resize-none !bg-transparent font-mono text-transparent',
						spellcheck: false,
						get value() {
							return snippetContent;
						},

						set value($$value) {
							snippetContent = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div></div> `);

					if (error) {
						$$renderer.push(`<!--[0--><p class="text-center text-red-500">${$.escape(error)}</p>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div>`);
				}

				function footer($$renderer) {
					{
						function primaryAction($$renderer, { props }) {
							Button($$renderer, $.spread_props([
								props,
								{
									onclick: handleSave,
									children: ($$renderer) => {
										Save($$renderer, { class: 'mr-2 size-4' });
										$$renderer.push(`<!----> Create Snippet`);
									},
									$$slots: { default: true }
								}
							]));
						}

						ActionBar($$renderer, {
							actions: [
								{
									title: 'Create Snippet',
									handler: handleSave,
									shortcut: { key: 'enter', modifiers: ['cmd'] }
								}
							],
							icon: snippetIcon,
							title: 'Create Snippet',
							primaryAction,
							$$slots: { primaryAction: true }
						});
					}
				}

				MainLayout($$renderer, {
					header,
					content,
					footer,
					$$slots: { header: true, content: true, footer: true }
				});
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}