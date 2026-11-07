import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import VirtualList from '$lib/VirtualList.svelte';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<div id="scroll-to-index-example" class="example-page"><h3>Scroll to index</h3> <div class="field label border"><input id="scroll-to-index" type="number"/> <label for="scroll-to-index">Scroll to index...</label></div> <div class="field label suffix border"><select id="alignment"><option>start</option><option>center</option><option>end</option><option>auto</option></select> <label for="alignment">Alignment</label> <i>arrow_drop_down</i></div> <div class="field label suffix border"><select id="behaviour"><option>auto</option><option>smooth</option><option>instant</option></select> <label for="behaviour">Behaviour</label> <i>arrow_drop_down</i></div> <article><!></article></div>`);

export default function _page($$anchor) {
	/** @type {number[]} */
	let rowHeights = $.state([]);

	let scrollToIndex = $.state(void 0);

	/** @type {'start' | 'center' | 'end' | 'auto'} */
	let scrollToAlignment = $.state('start');

	/** @type {'auto' | 'smooth' | 'instant'} */
	let scrollToBehaviour = $.state('instant');

	const NUM_ROWS = 10000;

	function randomize() {
		const newRowHeights = [];

		for (let i = 0; i < NUM_ROWS; i++) newRowHeights.push(Math.random() * (155 - 50) + 50);

		$.set(rowHeights, newRowHeights);
	}

	randomize();

	var div = root_1();

	$.head('dh3z01', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Scroll to index | svelte-tiny-virtual-list';
		});
	});

	var div_1 = $.sibling($.child(div), 2);
	var input = $.child(div_1);

	$.remove_input_defaults(input);
	$.next(2);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var select = $.child(div_2);
	var option = $.child(select);

	option.value = option.__value = 'start';

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 'center';

	var option_2 = $.sibling(option_1);

	option_2.value = option_2.__value = 'end';

	var option_3 = $.sibling(option_2);

	option_3.value = option_3.__value = 'auto';
	$.reset(select);
	$.init_select(select);
	$.next(4);
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var select_1 = $.child(div_3);
	var option_4 = $.child(select_1);

	option_4.value = option_4.__value = 'auto';

	var option_5 = $.sibling(option_4);

	option_5.value = option_5.__value = 'smooth';

	var option_6 = $.sibling(option_5);

	option_6.value = option_6.__value = 'instant';
	$.reset(select_1);
	$.init_select(select_1);
	$.next(4);
	$.reset(div_3);

	var article = $.sibling(div_3, 2);
	var node = $.child(article);

	{
		const item = ($$anchor, $$arg0) => {
			let style = () => ($$arg0?.()).style;
			let index = () => ($$arg0?.()).index;
			var div_4 = root();
			let classes;
			var text = $.only_child(div_4);

			$.template_effect(() => {
				$.set_style(div_4, style());
				classes = $.set_class(div_4, 1, 'virtual-list-row', null, classes, { highlighted: index() === $.get(scrollToIndex) });
				$.set_text(text, `Item #${index() ?? ''}`);
			});

			$.append($$anchor, div_4);
		};

		VirtualList(node, {
			height: 500,
			width: 'auto',
			itemCount: 10000,
			itemSize: (index) => $.get(rowHeights)[index],
			get scrollToIndex() {
				return $.get(scrollToIndex);
			},

			get scrollToAlignment() {
				return $.get(scrollToAlignment);
			},

			get scrollToBehaviour() {
				return $.get(scrollToBehaviour);
			},
			item,
			$$slots: { item: true }
		});
	}

	$.reset(article);
	$.reset(div);
	$.bind_value(input, () => $.get(scrollToIndex), ($$value) => $.set(scrollToIndex, $$value));
	$.bind_select_value(select, () => $.get(scrollToAlignment), ($$value) => $.set(scrollToAlignment, $$value));
	$.bind_select_value(select_1, () => $.get(scrollToBehaviour), ($$value) => $.set(scrollToBehaviour, $$value));
	$.append($$anchor, div);
}