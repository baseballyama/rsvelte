import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NodeViewContent, NodeViewWrapper } from '../../tiptap/index.js';
import Check from '@lucide/svelte/icons/check';
import Copy from '@lucide/svelte/icons/copy';
import { Sparkle } from '@lucide/svelte';
import Tooltip from './Tooltip.svelte';

var root = $.from_html(`<button class="edra-btn edra-btn-ghost edra-btn-icon-xs"><!></button>`);
var root_1 = $.from_html(`<option> </option>`);
var root_2 = $.from_html(`<select class="edra-select codeblock-select svelte-ds66bl"><option>Plain Text</option><!></select>`);

var root_3 = $.from_html(
	`<div class="codeblock-actions svelte-ds66bl" contenteditable="false"><!> <!> <button class="edra-btn edra-btn-ghost edra-btn-icon-xs copy-btn svelte-ds66bl"><!></button></div> <pre spellcheck="false" class="codeblock-pre svelte-ds66bl">
		<!>
	</pre>`,
	1
);

export default function CodeBlock($$anchor, $$props) {
	$.push($$props, true);

	let preRef = $.state(void 0);
	let isCopying = $.state(false);
	const languages = $.derived(() => $$props.extension.options.lowlight.listLanguages().sort());
	let defaultLanguage = $.derived(() => $$props.node.attrs.language ?? 'plaintext');

	const changeLanguage = (e) => {
		const select = e.target;
		const language = select.value;

		$$props.updateAttributes({ language });
	};

	function copyCode() {
		if (!$.get(preRef)) return;

		$.set(isCopying, true);
		navigator.clipboard.writeText($.get(preRef).innerText);

		setTimeout(
			() => {
				$.set(isCopying, false);
			},
			1000
		);
	}

	function convertToMermaid() {
		const code = $$props.node.textContent;
		const pos = $$props.getPos();

		if (typeof pos !== 'number') return;

		$$props.editor.chain().focus().deleteRange({ from: pos, to: pos + $$props.node.nodeSize }).insertContentAt(pos, {
			type: 'mermaid',
			content: [{ type: 'text', text: code || '' }]
		}).run();
	}

	NodeViewWrapper($$anchor, {
		class: 'codeblock-wrapper',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var div = $.first_child(fragment_1);
			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					Tooltip($$anchor, {
						tooltip: 'Convert to Mermaid Diagram',
						children: ($$anchor, $$slotProps) => {
							var button = root();
							var node_2 = $.child(button);

							Sparkle(node_2, { class: 'sparkle-icon' });
							$.reset(button);
							$.delegated('click', button, convertToMermaid);
							$.append($$anchor, button);
						},
						$$slots: { default: true }
					});
				};

				var d = $.derived(() => $.get(defaultLanguage).toLowerCase() === 'mermaid');

				$.if(node_1, ($$render) => {
					if ($.get(d)) $$render(consequent);
				});
			}

			var node_3 = $.sibling(node_1, 2);

			Tooltip(node_3, {
				tooltip: 'Change Language',
				children: ($$anchor, $$slotProps) => {
					var select_1 = root_2();
					var option = $.child(select_1);

					option.value = option.__value = 'plaintext';

					var node_4 = $.sibling(option);

					$.each(node_4, 16, () => $.get(languages), (language) => language, ($$anchor, language) => {
						var option_1 = root_1();
						var text = $.only_child(option_1, true);
						var option_1_value = {};

						$.template_effect(() => {
							$.set_text(text, language);

							if (option_1_value !== (option_1_value = language)) {
								option_1.value = (option_1.__value = option_1_value) ?? '';
							}
						});

						$.append($$anchor, option_1);
					});

					$.reset(select_1);

					var select_1_value;

					$.init_select(select_1);

					$.template_effect(() => {
						select_1.disabled = !$$props.editor.isEditable;

						if (select_1_value !== (select_1_value = $.get(defaultLanguage))) {
							(
								select_1.value = (select_1.__value = select_1_value) ?? '',
								$.select_option(select_1, select_1_value)
							);
						}
					});

					$.delegated('change', select_1, changeLanguage);
					$.append($$anchor, select_1);
				},
				$$slots: { default: true }
			});

			var button_1 = $.sibling(node_3, 2);
			var node_5 = $.child(button_1);

			{
				var consequent_1 = ($$anchor) => {
					Check($$anchor, { class: 'success-icon' });
				};

				var alternate = ($$anchor) => {
					Copy($$anchor, { class: 'copy-icon' });
				};

				$.if(node_5, ($$render) => {
					if ($.get(isCopying)) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.reset(button_1);
			$.reset(div);

			var pre = $.sibling(div, 2);

			$.set_attribute(pre, 'draggable', false);

			var node_6 = $.sibling($.child(pre));

			{
				let $0 = $.derived(() => `language-${$.get(defaultLanguage)}`);

				NodeViewContent(node_6, $.spread_props(
					{
						as: 'code',
						get class() {
							return $.get($0);
						}
					},
					() => $$props.node.attrs
				));
			}

			$.next();
			$.reset(pre);
			$.bind_this(pre, ($$value) => $.set(preRef, $$value), () => $.get(preRef));
			$.delegated('click', button_1, copyCode);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click', 'change']);