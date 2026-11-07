import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import NodeRenderer from '$lib/components/NodeRenderer.svelte';
import List from '$lib/components/nodes/List.svelte';
import Grid from '$lib/components/nodes/Grid.svelte';
import Detail from '$lib/components/nodes/detail/Detail.svelte';

var root = $.from_html(`<div class="h-full border-l"><!></div>`);
var root_1 = $.from_html(`<div class="grid w-full grow overflow-y-auto"><div class="h-full overflow-y-auto"><!></div> <!></div>`);

export default function Content($$anchor, $$props) {
	$.push($$props, true);

	const isShowingDetail = $.derived(() => $$props.rootNode?.type === 'List' && $$props.rootNode.props.isShowingDetail);
	const detailNodeId = $.derived(() => $$props.selectedItemNode?.namedChildren?.detail);
	var div = root_1();
	let styles;
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent_3 = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					List($$anchor, {
						get nodeId() {
							return $$props.rootNode.id;
						},

						get uiTree() {
							return $$props.uiTree;
						},

						get onSelect() {
							return $$props.onSelect;
						},

						get searchText() {
							return $$props.searchText;
						}
					});
				};

				var consequent_1 = ($$anchor) => {
					Grid($$anchor, {
						get nodeId() {
							return $$props.rootNode.id;
						},

						get uiTree() {
							return $$props.uiTree;
						},

						get onDispatch() {
							return $$props.onDispatch;
						},

						get onSelect() {
							return $$props.onSelect;
						},

						get searchText() {
							return $$props.searchText;
						}
					});
				};

				var consequent_2 = ($$anchor) => {
					Detail($$anchor, {
						get nodeId() {
							return $$props.rootNode.id;
						},

						get uiTree() {
							return $$props.uiTree;
						},

						get onDispatch() {
							return $$props.onDispatch;
						}
					});
				};

				var alternate = ($$anchor) => {
					NodeRenderer($$anchor, {
						get nodeId() {
							return $$props.rootNode.id;
						},

						get uiTree() {
							return $$props.uiTree;
						},

						get onDispatch() {
							return $$props.onDispatch;
						}
					});
				};

				$.if(node_1, ($$render) => {
					if ($$props.rootNode.type === 'List') $$render(consequent); else if ($$props.rootNode.type === 'Grid') $$render(consequent_1, 1); else if ($$props.rootNode.type === 'Detail') $$render(consequent_2, 2); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.rootNode) $$render(consequent_3);
		});
	}

	$.reset(div_1);

	var node_2 = $.sibling(div_1, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_2 = root();
			var node_3 = $.child(div_2);

			{
				var consequent_4 = ($$anchor) => {
					NodeRenderer($$anchor, {
						get nodeId() {
							return $.get(detailNodeId);
						},

						get uiTree() {
							return $$props.uiTree;
						},

						get onDispatch() {
							return $$props.onDispatch;
						}
					});
				};

				$.if(node_3, ($$render) => {
					if ($.get(detailNodeId)) $$render(consequent_4);
				});
			}

			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node_2, ($$render) => {
			if ($.get(isShowingDetail)) $$render(consequent_5);
		});
	}

	$.reset(div);

	$.template_effect(() => styles = $.set_style(div, '', styles, {
		'grid-template-columns': $.get(isShowingDetail) ? '1fr 512px' : '1fr'
	}));

	$.append($$anchor, div);
	$.pop();
}