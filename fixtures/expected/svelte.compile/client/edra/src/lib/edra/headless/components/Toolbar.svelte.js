import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { commands } from '../../commands/index.js';
import { addAIHighlight, getEditor, useEditorTransaction } from '../../tiptap/index.js';
import { cn } from '$lib/utils.js';
import { WandSparkles } from '@lucide/svelte';
import Colors from './tools/Colors.svelte';
import Export from './tools/Export.svelte';
import Tooltip from './Tooltip.svelte';

var root = $.from_html(`<button class="edra-btn edra-btn-ghost edra-btn-icon"><!></button>`);
var root_1 = $.from_html(`<button><!></button>`);
var root_2 = $.from_html(`<!> <div class="edra-separator" role="separator" aria-orientation="vertical"></div>`, 1);
var root_3 = $.from_html(`<div><!> <!> <!> <!></div>`);

export default function Toolbar($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();
	const transaction = useEditorTransaction(editor);
	const commandsKeys = Object.keys(commands);

	function useAI() {
		void transaction.version;

		return editor.extensionManager.extensions.some((e) => e.name === 'ai-highlight' && e.options?.callAI != null);
	}

	function isActive(command) {
		void transaction.version;

		return command.isActive?.(editor) ?? false;
	}

	function isClickable(command) {
		void transaction.version;

		return command.clickable?.(editor) ?? true;
	}

	var div = root_3();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			Tooltip($$anchor, {
				tooltip: 'Use AI',
				children: ($$anchor, $$slotProps) => {
					var button = root();
					var node_1 = $.child(button);

					WandSparkles(node_1, {});
					$.reset(button);

					$.delegated('mousedown', button, (e) => {
						e.preventDefault();
						addAIHighlight(editor);
					});

					$.append($$anchor, button);
				},
				$$slots: { default: true }
			});
		};

		var d = $.derived(() => useAI());

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	$.each(node_2, 16, () => commandsKeys, (key) => key, ($$anchor, key) => {
		const group = $.derived(() => commands[key]);
		var fragment_1 = root_2();
		var node_3 = $.first_child(fragment_1);

		$.each(node_3, 17, () => $.get(group), $.index, ($$anchor, command) => {
			const Icon = $.derived(() => $.get(command).icon);

			{
				let $0 = $.derived(() => $.get(command).shortCut ?? '');

				Tooltip($$anchor, {
					get tooltip() {
						return $.get(command).tooltip;
					},

					get shortCut() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						var button_1 = root_1();
						var node_4 = $.child(button_1);

						$.component(node_4, () => $.get(Icon), ($$anchor, Icon_1) => {
							Icon_1($$anchor, {});
						});

						$.reset(button_1);

						$.template_effect(
							($0, $1) => {
								$.set_class(button_1, 1, `edra-btn edra-btn-ghost edra-btn-icon ${$0 ?? ''}`, 'svelte-177aoc0');
								button_1.disabled = $1;
							},
							[
								() => isActive($.get(command)) ? 'active' : '',
								() => !isClickable($.get(command))
							]
						);

						$.delegated('click', button_1, () => {
							$.get(command).onClick?.(editor);
						});

						$.append($$anchor, button_1);
					},
					$$slots: { default: true }
				});
			}
		});

		$.next(2);
		$.append($$anchor, fragment_1);
	});

	var node_5 = $.sibling(node_2, 2);

	Colors(node_5, {});

	var node_6 = $.sibling(node_5, 2);

	Export(node_6, {});
	$.reset(div);
	$.template_effect(($0) => $.set_class(div, 1, $0, 'svelte-177aoc0'), [() => $.clsx(cn('toolbar-container', $$props.class))]);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['mousedown', 'click']);