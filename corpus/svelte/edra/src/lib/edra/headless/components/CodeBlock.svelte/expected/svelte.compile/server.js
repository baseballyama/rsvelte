import * as $ from 'svelte/internal/server';
import { NodeViewContent, NodeViewWrapper } from '../../tiptap/index.js';
import Check from '@lucide/svelte/icons/check';
import Copy from '@lucide/svelte/icons/copy';
import { Sparkle } from '@lucide/svelte';
import Tooltip from './Tooltip.svelte';

export default function CodeBlock($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { editor, node, updateAttributes, extension, getPos } = $$props;
		let preRef = void 0;
		let isCopying = false;
		const languages = $.derived(() => extension.options.lowlight.listLanguages().sort());
		let defaultLanguage = $.derived(() => node.attrs.language ?? 'plaintext');

		const changeLanguage = (e) => {
			const select = e.target;
			const language = select.value;

			updateAttributes({ language });
		};

		function copyCode() {
			if (!preRef) return;

			isCopying = true;
			navigator.clipboard.writeText(preRef.innerText);

			setTimeout(
				() => {
					isCopying = false;
				},
				1000
			);
		}

		function convertToMermaid() {
			const code = node.textContent;
			const pos = getPos();

			if (typeof pos !== 'number') return;

			editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).insertContentAt(pos, {
				type: 'mermaid',
				content: [{ type: 'text', text: code || '' }]
			}).run();
		}

		NodeViewWrapper($$renderer, {
			class: 'codeblock-wrapper',
			children: ($$renderer) => {
				$$renderer.push(`<div class="codeblock-actions svelte-ds66bl" contenteditable="false">`);

				if (defaultLanguage().toLowerCase() === 'mermaid') {
					$$renderer.push('<!--[0-->');

					Tooltip($$renderer, {
						tooltip: 'Convert to Mermaid Diagram',
						children: ($$renderer) => {
							$$renderer.push(`<button class="edra-btn edra-btn-ghost edra-btn-icon-xs">`);
							Sparkle($$renderer, { class: 'sparkle-icon' });
							$$renderer.push(`<!----></button>`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				Tooltip($$renderer, {
					tooltip: 'Change Language',
					children: ($$renderer) => {
						$$renderer.select(
							{
								disabled: !editor.isEditable,
								class: 'edra-select codeblock-select',
								value: defaultLanguage(),
								onchange: changeLanguage
							},
							($$renderer) => {
								$$renderer.option({ value: 'plaintext' }, ($$renderer) => {
									$$renderer.push(`Plain Text`);
								});

								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(languages());

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let language = each_array[$$index];

									$$renderer.option({ value: language }, ($$renderer) => {
										$$renderer.push(`${$.escape(language)}`);
									});
								}

								$$renderer.push(`<!--]-->`);
							},
							'svelte-ds66bl'
						);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <button class="edra-btn edra-btn-ghost edra-btn-icon-xs copy-btn svelte-ds66bl">`);

				if (isCopying) {
					$$renderer.push('<!--[0-->');
					Check($$renderer, { class: 'success-icon' });
				} else {
					$$renderer.push('<!--[-1-->');
					Copy($$renderer, { class: 'copy-icon' });
				}

				$$renderer.push(`<!--]--></button></div> <pre${$.attr('draggable', false)} spellcheck="false" class="codeblock-pre svelte-ds66bl">
		`);

				NodeViewContent($$renderer, $.spread_props([
					{ as: 'code', class: `language-${defaultLanguage()}` },
					node.attrs
				]));

				$$renderer.push(`<!---->
	</pre>`);
			},
			$$slots: { default: true }
		});
	});
}