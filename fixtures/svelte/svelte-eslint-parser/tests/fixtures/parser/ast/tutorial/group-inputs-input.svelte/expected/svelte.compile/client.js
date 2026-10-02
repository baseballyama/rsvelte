import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<label><input type="checkbox"/> </label>`);
var root_1 = $.from_html(`<p>Please select at least one flavour</p>`);
var root_2 = $.from_html(`<p>Can't order more flavours than scoops!</p>`);
var root_3 = $.from_html(`<p> </p>`);
var root_4 = $.from_html(`<h2>Size</h2> <label><input type="radio"/> One scoop</label> <label><input type="radio"/> Two scoops</label> <label><input type="radio"/> Three scoops</label> <h2>Flavours</h2> <!> <!>`, 1);

export default function Group_inputs_input($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];
	let scoops = 1;
	let flavours = ['Mint choc chip'];

	function join(flavours) {
		if (flavours.length === 1) return flavours[0];

		return `${flavours.slice(0, -1).join(', ')} and ${flavours[flavours.length - 1]}`;
	}

	let menu = ['Cookies and cream', 'Mint choc chip', 'Raspberry ripple'];
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

	var node = $.sibling(label_2, 4);

	$.each(node, 17, () => menu, $.index, ($$anchor, flavour) => {
		var label_3 = root();
		var input_3 = $.child(label_3);

		$.remove_input_defaults(input_3);

		var input_3_value;
		var text = $.sibling(input_3);

		$.reset(label_3);

		$.template_effect(() => {
			if (input_3_value !== (input_3_value = $.get(flavour))) {
				input_3.value = (input_3.__value = input_3_value) ?? '';
			}

			$.set_text(text, ` ${$.get(flavour) ?? ''}`);
		});

		$.bind_group(
			binding_group_1,
			[],
			input_3,
			() => {
				$.get(flavour);

				return flavours;
			},
			($$value) => flavours = $$value
		);

		$.append($$anchor, label_3);
	});

	var node_1 = $.sibling(node, 2);

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

		$.if(node_1, ($$render) => {
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

	$.append($$anchor, fragment);
	$.pop();
}