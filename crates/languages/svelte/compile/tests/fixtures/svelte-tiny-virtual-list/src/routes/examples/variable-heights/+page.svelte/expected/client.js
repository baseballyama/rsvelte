import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import VirtualList from '$lib/VirtualList.svelte';

var root = $.from_html(`<div class="virtual-list-row"> </div>`);
var root_1 = $.from_html(`<div id="variable-heights-example" class="example-page"><h3>Variable heights</h3> <button class="responsive margin"><i aria-hidden="true">shuffle</i> <span>Randomize heights</span></button> <article><!></article></div>`);

export default function _page($$anchor) {
	/** @type {number[]} */
	let rowHeights = $.state($.proxy([]));

	randomize();

	function randomize() {
		let newRowHeights = [];

		for (let i = 0; i < 10000; i++) {
			newRowHeights.push(Math.random() * (155 - 50) + 50);
		}

		$.set(rowHeights, newRowHeights, true);
	}

	var div = root_1();

	$.head('140sny6', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Variable heights | svelte-tiny-virtual-list';
		});
	});

	var button = $.sibling($.child(div), 2);
	var article = $.sibling(button, 2);
	var node = $.child(article);

	{
		const item = ($$anchor, $$arg0) => {
			let style = () => ($$arg0?.()).style;
			let index = () => ($$arg0?.()).index;
			var div_1 = root();
			var text = $.only_child(div_1);

			$.template_effect(() => {
				$.set_style(div_1, style());
				$.set_text(text, `Item #${index() ?? ''}`);
			});

			$.append($$anchor, div_1);
		};

		VirtualList(node, {
			height: 500,
			width: 'auto',
			itemCount: 10000,
			get itemSize() {
				return $.get(rowHeights);
			},
			item,
			$$slots: { item: true }
		});
	}

	$.reset(article);
	$.reset(div);
	$.delegated('click', button, randomize);
	$.append($$anchor, div);
}

$.delegate(['click']);