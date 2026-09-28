import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTypedNode } from '$lib/node.svelte';
import { colorLikeToColor } from '$lib/props';
import Icon from '$lib/components/Icon.svelte';
import 'mode-watcher';
import { mode } from 'mode-watcher';

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<button type="button" class="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-sm"><!> <!></button>`);

export default function MetadataTagListItem($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(useTypedNode(() => ({
			nodeId: $$props.nodeId,
			uiTree: $$props.uiTree,
			type: [
				'Detail.Metadata.TagList.Item',
				'List.Item.Detail.Metadata.TagList.Item'
			]
		}))),
		componentProps = $.derived(() => $.get($$d).props);

	function handleClick() {
		$$props.onDispatch($$props.nodeId, 'onAction', []);
	}

	const color = $.derived(() => colorLikeToColor($.get(componentProps)?.color ?? '', mode.current === 'dark'));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var button = root_1();
			let styles;
			var node_1 = $.child(button);

			{
				var consequent = ($$anchor) => {
					Icon($$anchor, {
						get icon() {
							return $.get(componentProps).icon;
						},
						class: 'size-[18px]'
					});
				};

				$.if(node_1, ($$render) => {
					if ($.get(componentProps).icon) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					var span = root();
					var text = $.only_child(span, true);

					$.template_effect(() => $.set_text(text, $.get(componentProps).text));
					$.append($$anchor, span);
				};

				$.if(node_2, ($$render) => {
					if ($.get(componentProps).text) $$render(consequent_1);
				});
			}

			$.reset(button);

			$.template_effect(() => styles = $.set_style(button, '', styles, {
				color: $.get(color),
				'background-color': `color-mix(in srgb, ${$.get(color) ?? ''} 15%, transparent)`
			}));

			$.delegated('click', button, handleClick);
			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if ($.get(componentProps)) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);