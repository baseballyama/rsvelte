import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import VirtualList from '$lib/VirtualList.svelte';

var root = $.from_html(`<div class="virtual-list-col"> </div>`);
var root_1 = $.from_html(`<div id="horizontal-list-example" class="example-page"><h3>Horizontal list</h3> <article><div class="row scroll"><!></div></article></div>`);

export default function _page($$anchor) {
	let width = $.state(500);
	var div = root_1();

	$.head('61hm4s', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Horizontal list | svelte-tiny-virtual-list';
		});
	});

	var article = $.sibling($.child(div), 2);
	var div_1 = $.child(article);
	var node = $.child(div_1);

	{
		const item = ($$anchor, $$arg0) => {
			let style = () => ($$arg0?.()).style;
			let index = () => ($$arg0?.()).index;
			var div_2 = root();
			var text = $.only_child(div_2);

			$.template_effect(() => {
				$.set_style(div_2, style());
				$.set_text(text, `Item #${index() ?? ''}`);
			});

			$.append($$anchor, div_2);
		};

		VirtualList(node, {
			height: '200px',
			get width() {
				return $.get(width);
			},
			scrollDirection: 'horizontal',
			itemCount: 100000,
			itemSize: 150,
			item,
			$$slots: { item: true }
		});
	}

	$.reset(div_1);
	$.reset(article);
	$.reset(div);
	$.bind_element_size(div_1, 'clientWidth', ($$value) => $.set(width, $$value));
	$.append($$anchor, div);
}