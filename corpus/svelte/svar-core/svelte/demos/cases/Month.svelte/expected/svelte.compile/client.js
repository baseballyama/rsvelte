import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Month } from "../../src/index";
import { getContext } from "svelte";

var root = $.from_html(`<div class="demo-box"><h3>Month view</h3> <div class="row svelte-t2pv3"><div class="cell svelte-t2pv3"><!></div> <div class="cell svelte-t2pv3"><!></div> <div class="cell svelte-t2pv3"><!></div></div></div> <div class="demo-box custom svelte-t2pv3"><h3>Month view with custom styles</h3> <!></div>`, 1);

export default function Month_1($$anchor, $$props) {
	$.push($$props, true);

	const helpers = getContext("wx-helpers");
	const value = new Date(2025, 4, 1);

	const addMonth = (date, n) => {
		const next = new Date(date);

		next.setMonth(next.getMonth() + n);

		return next;
	};

	function onchange(date) {
		helpers.showNotice({ text: "click on " + date.toString().substring(0, 15) });
	}

	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	{
		let $0 = $.derived(() => addMonth(value, 0));

		Month(node, {
			get current() {
				return $.get($0);
			},
			onchange
		});
	}

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_1 = $.child(div_3);

	{
		let $0 = $.derived(() => addMonth(value, 1));

		Month(node_1, {
			get current() {
				return $.get($0);
			},
			onchange
		});
	}

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_2 = $.child(div_4);

	{
		let $0 = $.derived(() => addMonth(value, 2));

		Month(node_2, {
			get current() {
				return $.get($0);
			},
			onchange
		});
	}

	$.reset(div_4);
	$.reset(div_1);
	$.reset(div);

	var div_5 = $.sibling(div, 2);
	var node_3 = $.sibling($.child(div_5), 2);

	Month(node_3, { current: new Date(2022, 2, 18) });
	$.reset(div_5);
	$.append($$anchor, fragment);
	$.pop();
}