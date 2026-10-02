import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import VirtualList from '$lib/VirtualList.svelte';

var root = $.from_html(`<div class="virtual-list-row"> </div>`);
var root_1 = $.from_html(`<div id="elements-of-equal-height-example" class="example-page"><h3>Elements of equal height</h3> <div class="range-field"><label for="item-size">Item size</label> <div class="slider"><input id="item-size" type="range" step="5" min="50" max="155"/> <span></span></div></div> <article><!></article></div>`);

export default function _page($$anchor) {
	let itemSize = 50;
	var div = root_1();

	$.head('1pqhz2b', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Elements of equal height | svelte-tiny-virtual-list';
		});
	});

	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.sibling($.child(div_1), 2);
	var input = $.child(div_2);

	$.remove_input_defaults(input);
	$.next(2);
	$.reset(div_2);
	$.reset(div_1);

	var article = $.sibling(div_1, 2);
	var node = $.child(article);

	{
		const item = ($$anchor, $$arg0) => {
			let style = () => ($$arg0?.()).style;
			let index = () => ($$arg0?.()).index;
			var div_3 = root();
			var text = $.only_child(div_3);

			$.template_effect(() => {
				$.set_style(div_3, style());
				$.set_text(text, `Item #${index() ?? ''}`);
			});

			$.append($$anchor, div_3);
		};

		VirtualList(node, {
			height: 500,
			width: 'auto',
			itemCount: 100000,
			get itemSize() {
				return itemSize;
			},
			item,
			$$slots: { item: true }
		});
	}

	$.reset(article);
	$.reset(div);
	$.bind_value(input, () => itemSize, ($$value) => itemSize = $$value);
	$.append($$anchor, div);
}