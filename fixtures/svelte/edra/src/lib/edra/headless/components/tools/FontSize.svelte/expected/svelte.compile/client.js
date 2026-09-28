import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Root, Trigger, Content, Label, Item, Shortcut } from '../../primitives/dropdown/index.ts';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Tooltip from '../Tooltip.svelte';
import { getEditor, useEditorTransaction } from '../../../tiptap/index.js';

var root = $.from_html(`<span> </span> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

var root_2 = $.from_html(
	`<!> <style>.trigger-font-btn {
			font-weight: 500;
		}
		:global(.chevron-icon) {
			color: var(--edra-mute);
			width: 0.5rem;
			height: 0.5rem;
		}</style> <!>`,
	1
);

export default function FontSize($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();
	const transaction = useEditorTransaction(editor);

	const currentSize = () => {
		void transaction.version;

		return editor.getAttributes('textStyle').fontSize || '';
	};

	const FONT_SIZE = [
		{ label: 'Tiny', value: '0.7rem' },
		{ label: 'Smaller', value: '0.75rem' },
		{ label: 'Small', value: '0.9rem' },
		{ label: 'Default', value: '' },
		{ label: 'Large', value: '1.25rem' },
		{ label: 'Extra Large', value: '1.5rem' }
	];

	const currentLabel = $.derived(() => {
		const l = FONT_SIZE.find((f) => f.value === currentSize());

		if (l) return l.label.split(' ')[0];

		return 'Medium';
	});

	Root($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			Tooltip(node, {
				tooltip: 'Font Size',
				children: ($$anchor, $$slotProps) => {
					Trigger($$anchor, {
						class: 'edra-btn edra-btn-ghost trigger-font-btn',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var span = $.first_child(fragment_3);
							var text = $.only_child(span, true);
							var node_1 = $.sibling(span, 2);

							ChevronDown(node_1, { class: 'chevron-icon' });
							$.template_effect(() => $.set_text(text, $.get(currentLabel)));
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node, 4);

			Content(node_2, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_3 = $.first_child(fragment_4);

					Label(node_3, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Font Size');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					$.each(node_4, 16, () => FONT_SIZE, (fontSize) => fontSize, ($$anchor, fontSize) => {
						Item($$anchor, {
							onclick: () => {
								editor.chain().focus().setFontSize(fontSize.value).run();
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root();
								var span_1 = $.first_child(fragment_6);
								var text_2 = $.only_child(span_1, true);
								var node_5 = $.sibling(span_1, 2);

								Shortcut(node_5, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text();

										$.template_effect(() => $.set_text(text_3, fontSize.value || 'default'));
										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});

								$.template_effect(() => $.set_text(text_2, fontSize.label));
								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}