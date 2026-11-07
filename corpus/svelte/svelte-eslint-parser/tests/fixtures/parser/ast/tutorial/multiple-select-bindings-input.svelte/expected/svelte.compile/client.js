import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<p>Please select at least one flavour</p>`);
var root_2 = $.from_html(`<p>Can't order more flavours than scoops!</p>`);
var root_3 = $.from_html(`<p> </p>`);
var root_4 = $.from_html(`<h2>Size</h2> <label><input type="radio"/> One scoop</label> <label><input type="radio"/> Two scoops</label> <label><input type="radio"/> Three scoops</label> <h2>Flavours</h2> <select multiple=""></select> <!>`, 1);

export default function Multiple_select_bindings_input($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	let scoops = 1;
	let flavours = ['Mint choc chip'];
	let menu = ['Cookies and cream', 'Mint choc chip', 'Raspberry ripple'];

	function join(flavours) {
		if (flavours.length === 1) return flavours[0];

		return `${flavours.slice(0, -1).join(', ')} and ${flavours[flavours.length - 1]}`;
	}

	var fragment = root_4();
	var label = $.sibling($.first_child(fragment), 2);
	var input = $.child(label);

	$.remove_input_defaults(input);
	input.value = input.__value = 1;
	$.next();
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.child(label_1);

	$.remove_input_defaults(input_1);
	input_1.value = input_1.__value = 2;
	$.next();
	$.reset(label_1);

	var label_2 = $.sibling(label_1, 2);
	var input_2 = $.child(label_2);

	$.remove_input_defaults(input_2);
	input_2.value = input_2.__value = 3;
	$.next();
	$.reset(label_2);

	var select = $.sibling(label_2, 4);

	$.each(select, 21, () => menu, $.index, ($$anchor, flavour) => {
		var option = root();
		var text = $.only_child(option, true);
		var option_value = {};

		$.template_effect(() => {
			$.set_text(text, $.get(flavour));

			if (option_value !== (option_value = $.get(flavour))) {
				option.value = (option.__value = option_value) ?? '';
			}
		});

		$.append($$anchor, option);
	});

	$.reset(select);
	$.init_select(select);

	var node = $.sibling(select, 2);

	{
		var consequent = ($$anchor) => {
			var p = root_1();

			$.append($$anchor, p);
		};

		var consequent_1 = ($$anchor) => {
			var p_1 = root_2();

			$.append($$anchor, p_1);
		};

		var alternate = ($$anchor) => {
			var p_2 = root_3();
			var text_1 = $.only_child(p_2);

			$.template_effect(
				($0) => $.set_text(text_1, `You ordered ${scoops ?? ''} ${scoops === 1 ? 'scoop' : 'scoops'}
		of ${$0 ?? ''}`),
				[() => join(flavours)]
			);

			$.append($$anchor, p_2);
		};

		$.if(node, ($$render) => {
			if (flavours.length === 0) $$render(consequent); else if (flavours.length > scoops) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.bind_group(
		binding_group,
		[],
		input,
		() => {
			1;

			return scoops;
		},
		($$value) => scoops = $$value
	);

	$.bind_group(
		binding_group,
		[],
		input_1,
		() => {
			2;

			return scoops;
		},
		($$value) => scoops = $$value
	);

	$.bind_group(
		binding_group,
		[],
		input_2,
		() => {
			3;

			return scoops;
		},
		($$value) => scoops = $$value
	);

	$.bind_select_value(select, () => flavours, ($$value) => flavours = $$value);
	$.append($$anchor, fragment);
	$.pop();
}