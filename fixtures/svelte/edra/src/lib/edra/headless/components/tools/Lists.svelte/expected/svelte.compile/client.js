import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Root, Trigger, Content, Label, Item, Shortcut } from '../../primitives/dropdown/index.ts';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Minus from '@lucide/svelte/icons/minus';
import { commands } from '../../../commands/index.js';
import { getEditor, useEditorTransaction } from '../../../tiptap/index.js';
import Tooltip from '../Tooltip.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <span> </span> <!>`, 1);

export default function Lists($$anchor, $$props) {
	$.push($$props, true);

	const lists = commands['lists'];
	const editor = getEditor();
	const transaction = useEditorTransaction(editor);

	const isActive = () => {
		void transaction.version;

		return lists.some((h) => h.isActive?.(editor));
	};

	const ListIcon = () => {
		void transaction.version;

		const h = lists.find((h) => h.isActive?.(editor));

		return h ? h.icon : Minus;
	};

	Root($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Tooltip(node, {
				tooltip: 'Lists',
				children: ($$anchor, $$slotProps) => {
					const Icon = $.derived(ListIcon);

					{
						let $0 = $.derived(() => isActive() ? 'active' : '');

						Trigger($$anchor, {
							get class() {
								return `edra-btn edra-btn-ghost edra-btn-icon ${$.get($0) ?? ''}`;
							},

							children: ($$anchor, $$slotProps) => {
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

							var text = $.text('Lists');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					$.each(node_5, 16, () => lists, (list) => list, ($$anchor, list) => {
						const Icon = $.derived(() => list.icon);

						Item($$anchor, {
							onclick: () => list.onClick?.(editor),
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root_1();
								var node_6 = $.first_child(fragment_6);

								$.component(node_6, () => $.get(Icon), ($$anchor, Icon_2) => {
									Icon_2($$anchor, { class: 'list-icon' });
								});

								var span = $.sibling(node_6, 2);
								var text_1 = $.only_child(span, true);
								var node_7 = $.sibling(span, 2);

								Shortcut(node_7, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text();

										$.template_effect(() => $.set_text(text_2, list.shortCut));
										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});

								$.template_effect(() => $.set_text(text_1, list.tooltip));
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