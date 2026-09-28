import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ALIGNMENT, SCROLL_BEHAVIOR } from '$lib';
import { VirtualList } from 'svelte-virtuallists';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<b>Please check the browser console to see event traces</b> <div class="actions"><div class="select"><span>Scroll to row index <input id="index" type="number" placeholder="pick an index..." class="input"/></span></div> <div class="select"><span>Scroll to pixel offset <input id="offset" type="number" placeholder="pick an offset..." class="input"/></span></div> <div class="select"><span>Alignment <select id="alignment"><option>auto</option><option>start</option><option>center</option><option>end</option></select></span></div> <div class="select"><span>Behaviour <select id="behaviour"><option>auto</option><option>smooth</option><option>instant</option></select></span></div></div> <!> <div class="actions"><button class="button">Randomize row heights</button> <button class="button">Same row heights</button> <button class="button">Randomize content</button> <button class="button">array size -10</button></div>`, 1);

export default function Code($$anchor, $$props) {
	$.push($$props, true);

	const myModel = $.proxy(new Array(10000));
	let scrollToAlignment = $.state($.proxy(ALIGNMENT.AUTO));
	let scrollToBehaviour = $.state($.proxy(SCROLL_BEHAVIOR.SMOOTH));
	let szCalculator = $.state(void 0);

	// holds randomized sizes
	let randSizes;

	function handleMessage(prefix, event) {
		console.log(prefix + JSON.stringify(event));
	}

	let scrollToProps = $.proxy({});

	function updateScrollToProps(key, value) {
		if (key === 'scrollToIndex') {
			scrollToProps.scrollToIndex = value;
			scrollToProps.scrollToOffset = undefined;
		} else if (key === 'scrollToOffset') {
			scrollToProps.scrollToOffset = value;
			scrollToProps.scrollToIndex = undefined;
		}
	}

	function randomizeSize() {
		randSizes = new Array(myModel.length);

		for (let i = 0; i < randSizes.length; i++) {
			randSizes[i] = Math.round(Math.random() * 65 + 30);
		}

		$.set(szCalculator, (_index, _item) => randSizes[_index]);
	}

	function sameSize() {
		$.set(szCalculator, () => 25);
	}

	function randomizeContent() {
		for (let i = 0; i < myModel.length; i++) {
			myModel[i] = { text: Math.floor(Math.random() * myModel.length) }; // Random number between 0 and 9999
		}
	}

	function stripItemsBy10() {
		for (let i = 0; i < 10; i++) myModel.pop();
	}

	randomizeContent();
	randomizeSize();

	var fragment = root_1();
	var div = $.sibling($.first_child(fragment), 2);
	var div_1 = $.child(div);
	var span = $.child(div_1);
	var input = $.sibling($.child(span));

	$.remove_input_defaults(input);
	$.reset(span);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var span_1 = $.child(div_2);
	var input_1 = $.sibling($.child(span_1));

	$.remove_input_defaults(input_1);
	$.reset(span_1);
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var span_2 = $.child(div_3);
	var select = $.sibling($.child(span_2));
	var option = $.child(select);

	option.value = option.__value = 'auto';

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 'start';

	var option_2 = $.sibling(option_1);

	option_2.value = option_2.__value = 'center';

	var option_3 = $.sibling(option_2);

	option_3.value = option_3.__value = 'end';
	$.reset(select);
	$.init_select(select);
	$.reset(span_2);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var span_3 = $.child(div_4);
	var select_1 = $.sibling($.child(span_3));
	var option_4 = $.child(select_1);

	option_4.value = option_4.__value = 'auto';

	var option_5 = $.sibling(option_4);

	option_5.value = option_5.__value = 'smooth';

	var option_6 = $.sibling(option_5);

	option_6.value = option_6.__value = 'instant';
	$.reset(select_1);
	$.init_select(select_1);
	$.reset(span_3);
	$.reset(div_4);
	$.reset(div);

	var node = $.sibling(div, 2);

	{
		const vl_slot = ($$anchor, $$arg0) => {
			let index = () => ($$arg0?.()).index;
			let item = () => ($$arg0?.()).item;
			let size = () => ($$arg0?.()).size;
			var div_5 = root();
			let classes;
			var text = $.only_child(div_5);

			$.template_effect(() => {
				$.set_style(div_5, `border: 1px solid rgb(204, 204, 204); line-height: ${size() ?? ''}px;`);
				classes = $.set_class(div_5, 1, 'svelte-33h1zn', null, classes, { highlighted: index() === scrollToProps.scrollToIndex });

				$.set_text(text, `#${index() ?? ''}
      ${item().text ?? ''}`);
			});

			$.append($$anchor, div_5);
		};

		VirtualList(node, $.spread_props(
			{
				get items() {
					return myModel;
				},
				style: 'height:500px'
			},
			() => scrollToProps,
			{
				get scrollToAlignment() {
					return $.get(scrollToAlignment);
				},

				get scrollToBehaviour() {
					return $.get(scrollToBehaviour);
				},

				get sizingCalculator() {
					return $.get(szCalculator);
				},
				onAfterScroll: (...props) => handleMessage('onAfterScroll:', props),
				onVisibleRangeUpdate: (...props) => handleMessage('onVisibleRangeUpdate:', props),
				vl_slot,
				$$slots: { vl_slot: true }
			}
		));
	}

	var div_6 = $.sibling(node, 2);
	var button = $.child(div_6);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);

	$.reset(div_6);

	$.template_effect(() => {
		$.set_value(input, scrollToProps.scrollToIndex);
		$.set_value(input_1, scrollToProps.scrollToOffset);
	});

	$.delegated('input', input, (e) => updateScrollToProps('scrollToIndex', Number(e.currentTarget.value)));
	$.delegated('input', input_1, (e) => updateScrollToProps('scrollToOffset', Number(e.currentTarget.value)));
	$.bind_select_value(select, () => $.get(scrollToAlignment), ($$value) => $.set(scrollToAlignment, $$value));
	$.bind_select_value(select_1, () => $.get(scrollToBehaviour), ($$value) => $.set(scrollToBehaviour, $$value));
	$.delegated('click', button, randomizeSize);
	$.delegated('click', button_1, sameSize);
	$.delegated('click', button_2, randomizeContent);
	$.delegated('click', button_3, stripItemsBy10);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['input', 'click']);