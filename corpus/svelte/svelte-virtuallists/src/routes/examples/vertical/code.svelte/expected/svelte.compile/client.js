import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { VirtualList } from 'svelte-virtuallists';
import { getRandomSushi } from '../sushi';

var root = $.from_html(`<div class="slotStyle svelte-1gkukco"> </div>`);
var root_1 = $.from_html(`<div class="gradient myStyle svelte-1gkukco"><!></div>`);

export default function Code($$anchor, $$props) {
	$.push($$props, true);

	const myModel = new Array(10000).fill(1).map((v, i) => {
		return { text: '#' + i + ' ' + getRandomSushi() };
	});

	var div = root_1();
	var node = $.child(div);

	{
		const vl_slot = ($$anchor, $$arg0) => {
			let item = () => ($$arg0?.()).item;
			var div_1 = root();
			var text = $.only_child(div_1, true);

			$.template_effect(() => $.set_text(text, item().text));
			$.append($$anchor, div_1);
		};

		VirtualList(node, {
			get items() {
				return myModel;
			},
			style: 'height:600px',
			vl_slot,
			$$slots: { vl_slot: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}