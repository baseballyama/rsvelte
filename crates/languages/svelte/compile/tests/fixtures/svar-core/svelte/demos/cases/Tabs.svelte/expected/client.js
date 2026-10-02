import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tabs } from "../../src/index";
import { getContext } from "svelte";

var root = $.from_html(`<div class="body svelte-1r34yl9">Info</div>`);
var root_1 = $.from_html(`<div class="body svelte-1r34yl9">About</div>`);
var root_2 = $.from_html(`<div class="body svelte-1r34yl9">Check</div>`);
var root_3 = $.from_html(`<div class="demo-box"><h3>Tabs</h3> <div class="tabbar svelte-1r34yl9"><!> <!> <!></div> <h3>onchange</h3> <!></div>`);

export default function Tabs_1($$anchor, $$props) {
	$.push($$props, true);

	const { showNotice } = getContext("wx-helpers");

	const tabs = [
		{ id: 0, label: "Info", icon: "wxi-alert" },
		{ id: 1, label: "About" },
		{ id: 3, label: "", icon: "wxi-check" }
	];

	let active = $.state(2);

	function onchange({ value }) {
		$.set(active, value, true);
		showNotice({ type: "info", expire: 2000, text: "ID: " + $.get(active) });
	}

	var div = root_3();
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	Tabs(node, {
		get options() {
			return tabs;
		},

		get value() {
			return $.get(active);
		},

		set value($$value) {
			$.set(active, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var div_2 = root();

			$.append($$anchor, div_2);
		};

		var consequent_1 = ($$anchor) => {
			var div_3 = root_1();

			$.append($$anchor, div_3);
		};

		var alternate = ($$anchor) => {
			var div_4 = root_2();

			$.append($$anchor, div_4);
		};

		$.if(node_1, ($$render) => {
			if ($.get(active) === 0) $$render(consequent); else if ($.get(active) === 1) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	Tabs(node_2, {
		get options() {
			return tabs;
		},
		type: 'bottom',
		get value() {
			return $.get(active);
		},

		set value($$value) {
			$.set(active, $$value, true);
		}
	});

	$.reset(div_1);

	var node_3 = $.sibling(div_1, 4);

	Tabs(node_3, {
		get options() {
			return tabs;
		},
		value: 0,
		onchange
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}