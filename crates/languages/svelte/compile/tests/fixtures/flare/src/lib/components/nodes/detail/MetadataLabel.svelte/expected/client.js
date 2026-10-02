import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTypedNode } from '$lib/node.svelte';
import Icon from '$lib/components/Icon.svelte';

var root = $.from_html(`<span class="text-sm"> </span>`);
var root_1 = $.from_html(`<div><h3 class="text-muted-foreground mb-1 text-xs font-medium"> </h3> <div class="flex items-center gap-2"><!> <!></div></div>`);

export default function MetadataLabel($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(useTypedNode(() => ({
			nodeId: $$props.nodeId,
			uiTree: $$props.uiTree,
			type: ['Detail.Metadata.Label', 'List.Item.Detail.Metadata.Label']
		}))),
		componentProps = $.derived(() => $.get($$d).props);

	const textValue = $.derived(() => typeof $.get(componentProps)?.text === 'object'
		? $.get(componentProps).text.value
		: $.get(componentProps)?.text);

	const textColor = $.derived(() => typeof $.get(componentProps)?.text === 'object' ? $.get(componentProps).text.color : undefined);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var div = root_1();
			var h3 = $.child(div);
			var text = $.only_child(h3, true);
			var div_1 = $.sibling(h3, 2);
			var node_1 = $.child(div_1);

			{
				var consequent = ($$anchor) => {
					Icon($$anchor, {
						get icon() {
							return $.get(componentProps).icon;
						},
						class: 'size-4'
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
					let styles;
					var text_1 = $.only_child(span, true);

					$.template_effect(() => {
						styles = $.set_style(span, '', styles, { color: $.get(textColor) });
						$.set_text(text_1, $.get(textValue));
					});

					$.append($$anchor, span);
				};

				$.if(node_2, ($$render) => {
					if ($.get(textValue)) $$render(consequent_1);
				});
			}

			$.reset(div_1);
			$.reset(div);
			$.template_effect(() => $.set_text(text, $.get(componentProps).title));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(componentProps)) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}