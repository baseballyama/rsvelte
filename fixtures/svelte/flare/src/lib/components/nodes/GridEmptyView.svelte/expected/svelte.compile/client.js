import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTypedNode } from '$lib/node.svelte';
import Icon from '$lib/components/Icon.svelte';
import defaultIcon from '$lib/assets/no-results-placeholder-400100x78@2x.png';

var root = $.from_html(`<img class="mb-6 w-[90px]" alt="No results"/>`);
var root_1 = $.from_html(`<p class="text-muted-foreground max-w-md text-sm"> </p>`);
var root_2 = $.from_html(`<div class="flex h-full flex-col items-center justify-center gap-3 p-6 text-center"><!> <h2 class="text-lg font-medium"> </h2> <!></div>`);

export default function GridEmptyView($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(useTypedNode(() => ({
			nodeId: $$props.nodeId,
			uiTree: $$props.uiTree,
			type: 'Grid.EmptyView'
		}))),
		componentProps = $.derived(() => $.get($$d).props);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var div = root_2();
			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					Icon($$anchor, {
						get icon() {
							return $.get(componentProps).icon;
						},
						class: 'size-32 opacity-50'
					});
				};

				var alternate = ($$anchor) => {
					var img = root();

					$.template_effect(() => $.set_attribute(img, 'src', defaultIcon));
					$.append($$anchor, img);
				};

				$.if(node_1, ($$render) => {
					if ($.get(componentProps).icon) $$render(consequent); else $$render(alternate, -1);
				});
			}

			var h2 = $.sibling(node_1, 2);
			var text = $.only_child(h2, true);
			var node_2 = $.sibling(h2, 2);

			{
				var consequent_1 = ($$anchor) => {
					var p = root_1();
					var text_1 = $.only_child(p, true);

					$.template_effect(() => $.set_text(text_1, $.get(componentProps).description));
					$.append($$anchor, p);
				};

				$.if(node_2, ($$render) => {
					if ($.get(componentProps).description) $$render(consequent_1);
				});
			}

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