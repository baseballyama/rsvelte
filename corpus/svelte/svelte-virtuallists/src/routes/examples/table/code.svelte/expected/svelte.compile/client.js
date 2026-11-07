import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { VirtualList } from 'svelte-virtuallists';
import { getRandomSushi } from '../sushi';

var root = $.from_html(`<thead><tr><th>Text</th><th>Index</th></tr></thead>`);
var root_1 = $.from_html(`<tr><td> </td><td> </td></tr>`);

export default function Code($$anchor, $$props) {
	$.push($$props, true);

	const myModel = new Array(10000).fill(1).map(() => {
		return { text: getRandomSushi() };
	});

	{
		const header = ($$anchor) => {
			var thead = root();

			$.append($$anchor, thead);
		};

		const vl_slot = ($$anchor, $$arg0) => {
			let item = () => ($$arg0?.()).item;
			let index = () => ($$arg0?.()).index;
			var tr = root_1();
			var td = $.child(tr);
			var text = $.only_child(td, true);
			var td_1 = $.sibling(td);
			var text_1 = $.only_child(td_1, true);

			$.reset(tr);

			$.template_effect(() => {
				$.set_text(text, index());
				$.set_text(text_1, item().text);
			});

			$.append($$anchor, tr);
		};

		VirtualList($$anchor, {
			get items() {
				return myModel;
			},
			class: 'list-table',
			style: 'height:600px',
			isTable: true,
			header,
			vl_slot,
			$$slots: { header: true, vl_slot: true }
		});
	}

	$.pop();
}