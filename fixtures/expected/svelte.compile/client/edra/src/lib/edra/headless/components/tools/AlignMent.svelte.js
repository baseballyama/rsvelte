import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Root, Trigger, Content, Label, Item, Shortcut } from '../../primitives/dropdown/index.ts';
import AlignLeft from '@lucide/svelte/icons/align-left';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Tooltip from '../Tooltip.svelte';
import { commands } from '../../../commands/index.js';
import { getEditor, useEditorTransaction } from '../../../tiptap/index.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <span> </span> <!>`, 1);

export default function AlignMent($$anchor, $$props) {
	$.push($$props, true);

	const alignments = commands['alignment'];
	const editor = getEditor();
	const transaction = useEditorTransaction(editor);

	const isActive = () => {
		void transaction.version;

		return alignments.find((h) => h.isActive?.(editor)) !== undefined;
	};

	const AlignmentIcon = () => {
		void transaction.version;

		const h = alignments.find((h) => h.isActive?.(editor));

		return h ? h.icon : AlignLeft;
	};

	Root($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Tooltip(node, {
				tooltip: 'Alignment',
				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => isActive() ? 'active' : '');

						Trigger($$anchor, {
							get class() {
								return `edra-btn edra-btn-ghost edra-btn-icon ${$.get($0) ?? ''}`;
							},

							children: ($$anchor, $$slotProps) => {
								const Icon = $.derived(AlignmentIcon);
								var fragment_3 = root();
								var node_1 = $.first_child(fragment_3);

								$.component(node_1, () => $.get(Icon), ($$anchor, Icon_1) => {
									Icon_1($$anchor, {});
								});

								var node_2 = $.sibling(node_1, 2);

								ChevronDown(node_2, { class: 'chevron-icon' });
								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					}
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			Content(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_4 = $.first_child(fragment_4);

					Label(node_4, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Alignments');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					$.each(node_5, 16, () => alignments, (alignment) => alignment, ($$anchor, alignment) => {
						const Icon = $.derived(() => alignment.icon);

						Item($$anchor, {
							onclick: () => alignment.onClick?.(editor),
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root_1();
								var node_6 = $.first_child(fragment_6);

								$.component(node_6, () => $.get(Icon), ($$anchor, Icon_2) => {
									Icon_2($$anchor, { class: 'align-icon' });
								});

								var span = $.sibling(node_6, 2);
								var text_1 = $.only_child(span, true);
								var node_7 = $.sibling(span, 2);

								Shortcut(node_7, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text();

										$.template_effect(() => $.set_text(text_2, alignment.shortCut));
										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});

								$.template_effect(() => $.set_text(text_1, alignment.tooltip));
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