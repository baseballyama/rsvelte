import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import VirtualList from './VirtualList.svelte';

var root = $.from_html(` <div> </div>`, 1);
var root_1 = $.from_html(`<div style="height: 400px; width: 400px;"><!></div>`);

export default function VirtualList_test($$anchor, $$props) {
	$.push($$props, true);

	/** @type {{ data: { id: number, label: string }[], scrollOffset: number, onItemRender: (index: number) => void }} */
	let data = $.prop($$props, 'data', 19, () => []),
		onItemRender = $.prop($$props, 'onItemRender', 3, () => {});

	var div = root_1();
	var node = $.child(div);

	{
		const item = ($$anchor, $$arg0) => {
			let index = () => ($$arg0?.()).index;
			let style = () => ($$arg0?.()).style;

			$.next();

			var fragment = root();
			var text = $.first_child(fragment);
			var div_1 = $.sibling(text);
			var text_1 = $.only_child(div_1, true);

			$.template_effect(
				($0) => {
					$.set_text(text, `${$0 ?? ''} `);
					$.set_style(div_1, style());
					$.set_text(text_1, data()[index()]?.label);
				},
				[() => (onItemRender()(index()), '')]
			);

			$.append($$anchor, fragment);
		};

		VirtualList(node, {
			height: '200px',
			width: 300,
			scrollDirection: 'horizontal',
			get itemCount() {
				return data().length;
			},
			itemSize: 50,
			get scrollOffset() {
				return $$props.scrollOffset;
			},
			item,
			$$slots: { item: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}