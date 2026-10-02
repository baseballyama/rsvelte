import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTypedNode } from '$lib/node.svelte';
import NodeRenderer from '$lib/components/NodeRenderer.svelte';
import SvelteMarked from 'svelte-marked';

var root = $.from_html(`<article class="prose dark:prose-invert prose-img:mx-auto prose-img:max-w-full prose-sm max-w-full"><!></article>`);
var root_1 = $.from_html(`<aside><!></aside>`);
var root_2 = $.from_html(`<div><main><!></main> <!></div>`);

export default function Detail($$anchor, $$props) {
	$.push($$props, true);

	let layout = $.prop($$props, 'layout', 3, 'horizontal');

	const $$d = $.derived(useTypedNode(() => ({
			nodeId: $$props.nodeId,
			uiTree: $$props.uiTree,
			type: ['Detail', 'List.Item.Detail']
		}))),
		node = $.derived(() => $.get($$d).node),
		detailProps = $.derived(() => $.get($$d).props);

	const metadataNodeId = $.derived(() => $.get(node)?.namedChildren?.['metadata']);
	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var div = root_2();
			let classes;
			var main = $.child(div);
			let classes_1;
			var node_2 = $.child(main);

			{
				var consequent = ($$anchor) => {
					var article = root();
					var node_3 = $.child(article);

					SvelteMarked(node_3, {
						get source() {
							return $.get(detailProps).markdown;
						}
					});

					$.reset(article);
					$.append($$anchor, article);
				};

				$.if(node_2, ($$render) => {
					if ($.get(detailProps).markdown) $$render(consequent);
				});
			}

			$.reset(main);

			var node_4 = $.sibling(main, 2);

			{
				var consequent_1 = ($$anchor) => {
					var aside = root_1();
					let classes_2;
					var node_5 = $.child(aside);

					NodeRenderer(node_5, {
						get nodeId() {
							return $.get(metadataNodeId);
						},

						get uiTree() {
							return $$props.uiTree;
						},

						get onDispatch() {
							return $$props.onDispatch;
						}
					});

					$.reset(aside);

					$.template_effect(() => classes_2 = $.set_class(aside, 1, 'shrink-0 overflow-y-auto p-4', null, classes_2, {
						'w-72': layout() === 'horizontal',
						'border-l': layout() === 'horizontal',
						'border-t': layout() === 'vertical'
					}));

					$.append($$anchor, aside);
				};

				$.if(node_4, ($$render) => {
					if ($.get(metadataNodeId)) $$render(consequent_1);
				});
			}

			$.reset(div);

			$.template_effect(() => {
				classes = $.set_class(div, 1, 'flex h-full', null, classes, {
					'flex-row': layout() === 'horizontal',
					'flex-col': layout() === 'vertical'
				});

				classes_1 = $.set_class(main, 1, 'w-full overflow-y-auto', null, classes_1, {
					'p-6': layout() === 'horizontal',
					'p-4': layout() === 'vertical'
				});
			});

			$.append($$anchor, div);
		};

		$.if(node_1, ($$render) => {
			if ($.get(node) && $.get(detailProps)) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}