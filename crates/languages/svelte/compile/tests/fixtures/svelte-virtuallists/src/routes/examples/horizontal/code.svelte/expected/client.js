import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { VirtualList } from 'svelte-virtuallists';
import { getRandomSushi } from '../sushi';

var root = $.from_html(`<div style="border: 1px solid rgb(204, 204, 204)"> </div>`);

export default function Code($$anchor, $$props) {
	$.push($$props, true);

	const myModel = new Array(10000).fill(1).map((v, i) => {
		return { text: '#' + i + ' ' + getRandomSushi() };
	});

	{
		const vl_slot = ($$anchor, $$arg0) => {
			let item = () => ($$arg0?.()).item;
			var div = root();
			var text = $.only_child(div, true);

			$.template_effect(() => $.set_text(text, item().text));
			$.append($$anchor, div);
		};

		VirtualList($$anchor, {
			get items() {
				return myModel;
			},
			style: 'width:100%',
			isHorizontal: true,
			vl_slot,
			$$slots: { vl_slot: true }
		});
	}

	$.pop();
}