import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { VirtualList } from 'svelte-virtuallists';
import { getRandomSushi } from '../sushi';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<h2>Horizontal</h2> <!> <h2>Vertical</h2> <!> <div class="actions"><button class="button">Randomize row heights</button> <button class="button">Same row heights</button></div>`, 1);

export default function Code($$anchor, $$props) {
	$.push($$props, true);

	const myModel = new Array(10000).fill(1).map(() => {
		return { text: getRandomSushi() };
	});

	function randomize() {
		$.set(calculator, () => Math.round(Math.random() * (155 - 30) + 30));
	}

	function sameSize() {
		$.set(calculator, () => 25);
	}

	// @ts-expect-error undefined
	let calculator = $.state(void 0);

	randomize();

	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	{
		const vl_slot = ($$anchor, $$arg0) => {
			let index = () => ($$arg0?.()).index;
			let item = () => ($$arg0?.()).item;
			let size = () => ($$arg0?.()).size;
			var div = root();
			var text = $.only_child(div);

			$.template_effect(() => {
				$.set_style(div, `border: 1px solid rgb(204, 204, 204); width: ${size() ?? ''}px;`);

				$.set_text(text, `#${index() ?? ''}
      ${item().text ?? ''}`);
			});

			$.append($$anchor, div);
		};

		VirtualList(node, {
			get items() {
				return myModel;
			},
			style: 'width:100%',
			isHorizontal: true,
			get sizingCalculator() {
				return $.get(calculator);
			},
			vl_slot,
			$$slots: { vl_slot: true }
		});
	}

	var node_1 = $.sibling(node, 4);

	{
		const vl_slot = ($$anchor, $$arg0) => {
			let index = () => ($$arg0?.()).index;
			let item = () => ($$arg0?.()).item;
			let size = () => ($$arg0?.()).size;
			var div_1 = root();
			var text_1 = $.only_child(div_1);

			$.template_effect(() => {
				$.set_style(div_1, `border: 1px solid rgb(204, 204, 204); line-height: ${size() ?? ''}px;`);

				$.set_text(text_1, `#${index() ?? ''}
      ${item().text ?? ''}`);
			});

			$.append($$anchor, div_1);
		};

		VirtualList(node_1, {
			get items() {
				return myModel;
			},
			style: 'height:600px',
			get sizingCalculator() {
				return $.get(calculator);
			},
			vl_slot,
			$$slots: { vl_slot: true }
		});
	}

	var div_2 = $.sibling(node_1, 2);
	var button = $.child(div_2);
	var button_1 = $.sibling(button, 2);

	$.reset(div_2);
	$.delegated('click', button, randomize);
	$.delegated('click', button_1, sameSize);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);