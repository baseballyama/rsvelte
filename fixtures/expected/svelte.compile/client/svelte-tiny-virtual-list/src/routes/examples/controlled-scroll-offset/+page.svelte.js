import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import VirtualList from '$lib/VirtualList.svelte';

var root = $.from_html(`<div class="virtual-list-row"> </div>`);
var root_1 = $.from_html(`<div id="controlled-scroll-offset-example" class="example-page"><h3>Controlled scroll offset</h3> <div class="field label border"><input id="scroll-offset" type="number"/> <label for="scroll-offset">Scroll to offset...</label></div> <article><!></article></div>`);

export default function _page($$anchor) {
	/** @type {number[]} */
	let rowHeights = $.state($.proxy([]));

	let scrollOffset = $.state(void 0);

	randomize();

	function randomize() {
		let newRowHeights = [];

		for (let i = 0; i < 10000; i++) {
			newRowHeights.push(Math.random() * (155 - 50) + 50);
		}

		$.set(rowHeights, newRowHeights, true);
	}

	var div = root_1();

	$.head('1dy3z6r', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Controlled scroll offset | svelte-tiny-virtual-list';
		});
	});

	var div_1 = $.sibling($.child(div), 2);
	var input = $.child(div_1);

	$.remove_input_defaults(input);
	$.next(2);
	$.reset(div_1);

	var article = $.sibling(div_1, 2);
	var node = $.child(article);

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
			height: 500,
			width: 'auto',
			itemCount: 10000,
			itemSize: (index) => $.get(rowHeights)[index],
			get scrollOffset() {
				return $.get(scrollOffset);
			},
			item,
			$$slots: { item: true }
		});
	}

	$.reset(article);
	$.reset(div);
	$.bind_value(input, () => $.get(scrollOffset), ($$value) => $.set(scrollOffset, $$value));
	$.append($$anchor, div);
}