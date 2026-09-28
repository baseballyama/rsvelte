import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Segmented } from "../../src/index";

var root = $.from_html(`<i></i>`);
var root_1 = $.from_html(`<i></i> <span class="bottom svelte-1i607ph"> </span>`, 1);
var root_2 = $.from_html(`<div class="demo-box"><h3>Default templates</h3> <h4>Segmented Button</h4> <!> <h4>Segmented Button with icons</h4> <!> <h4>Segmented Button with a mixed content</h4> <!></div> <div class="demo-box"><h3>Custom templates</h3> <h4>Segmented Button</h4> <!> <h4>Segmented Button with icons</h4> <!> <h4>Segmented Button with a mixed content</h4> <!></div>`, 1);

export default function Segmented_1($$anchor) {
	const options = [
		{
			id: 1,
			label: "One",
			icon: "wxi-view-sequential",
			title: "Grid mode"
		},

		{
			id: 2,
			label: "Two",
			icon: "wxi-view-grid",
			title: "Tiles mode"
		},

		{
			id: 3,
			label: "Three",
			icon: "wxi-view-column",
			title: "Two panels mode"
		}
	];

	const optionsIcons = options.map((a) => ({ ...a, label: null }));
	const optionsText = options.map((a) => ({ ...a, icon: null }));
	let value = $.state(2);
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.sibling($.child(div), 4);

	Segmented(node, {
		get options() {
			return optionsText;
		},

		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 4);

	Segmented(node_1, {
		get options() {
			return optionsIcons;
		},

		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 4);

	Segmented(node_2, {
		get options() {
			return options;
		},
		value: 1
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_3 = $.sibling($.child(div_1), 4);

	Segmented(node_3, {
		get options() {
			return options;
		},

		get value() {
			return $.get(value);
		}
	});

	var node_4 = $.sibling(node_3, 4);

	{
		const children = ($$anchor, $$arg0) => {
			let option = () => ($$arg0?.()).option;
			var i = root();

			$.template_effect(() => $.set_class(i, 1, `icon ${option().icon ?? ''}`, 'svelte-1i607ph'));
			$.append($$anchor, i);
		};

		Segmented(node_4, {
			get options() {
				return options;
			},
			value: 1,
			children,
			$$slots: { default: true }
		});
	}

	var node_5 = $.sibling(node_4, 4);

	{
		const children = ($$anchor, $$arg0) => {
			let option = () => ($$arg0?.()).option;
			var fragment_1 = root_1();
			var i_1 = $.first_child(fragment_1);
			var span = $.sibling(i_1, 2);
			var text = $.only_child(span, true);

			$.template_effect(() => {
				$.set_class(i_1, 1, `icon ${option().icon ?? ''}`, 'svelte-1i607ph');
				$.set_text(text, option().label);
			});

			$.append($$anchor, fragment_1);
		};

		Segmented(node_5, {
			get options() {
				return options;
			},
			value: 2,
			children,
			$$slots: { default: true }
		});
	}

	$.reset(div_1);
	$.append($$anchor, fragment);
}