import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { Separator } from '$lib/components/ui/separator/index.js';
import { commands } from '../../commands/index.js';
import { addAIHighlight, getEditor, useEditorTransaction } from '../../tiptap/index.js';
import { cn } from '$lib/utils.js';
import { WandSparkles } from '@lucide/svelte';
import Colors from './tools/Colors.svelte';
import Export from './tools/Export.svelte';
import Tooltip from './Tooltip.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><!> <!> <!> <!></div>`);

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

	var div = root_1();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			Tooltip($$anchor, {
				tooltip: 'Use AI',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						onmousedown: (e) => {
							e.preventDefault();
							addAIHighlight(editor);
						},
						variant: 'ghost',
						size: 'icon',
						children: ($$anchor, $$slotProps) => {
							WandSparkles($$anchor, {});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		};

		var d = $.derived(() => useAI());

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 16, () => commandsKeys, (key) => key, ($$anchor, key) => {
		const group = $.derived(() => commands[key]);
		var fragment_3 = root();
		var node_2 = $.first_child(fragment_3);

		$.each(node_2, 17, () => $.get(group), $.index, ($$anchor, command) => {
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
						{
							let $0 = $.derived(() => cn(isActive($.get(command)) && 'bg-muted text-primary'));
							let $1 = $.derived(() => !isClickable($.get(command)));

							Button($$anchor, {
								variant: 'ghost',
								size: 'icon',
								get class() {
									return $.get($0);
								},

								get disabled() {
									return $.get($1);
								},

								onclick: () => {
									$.get(command).onClick?.(editor);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_6 = $.comment();
									var node_3 = $.first_child(fragment_6);

									$.component(node_3, () => $.get(Icon), ($$anchor, Icon_1) => {
										Icon_1($$anchor, {});
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						}
					},
					$$slots: { default: true }
				});
			}
		});

		var node_4 = $.sibling(node_2, 2);

		Separator(node_4, { orientation: 'vertical', class: 'h-6!' });
		$.append($$anchor, fragment_3);
	});

	var node_5 = $.sibling(node_1, 2);

	Colors(node_5, {});

	var node_6 = $.sibling(node_5, 2);

	Export(node_6, {});
	$.reset(div);

	$.template_effect(($0) => $.set_class(div, 1, $0), [
		() => $.clsx(cn('flex h-full w-fit items-center gap-2', $$props.class))
	]);

	$.append($$anchor, div);
	$.pop();
}