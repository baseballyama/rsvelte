import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PinInput } from "bits-ui";

const Cell = ($$anchor, props = $.noop, idx = $.noop) => {
	var div = root_1();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, props().char));
			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if (props().char !== null) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_1 = root();

			$.template_effect(() => $.set_attribute(div_1, 'data-testid', `caret-${idx() ?? ''}`));
			$.append($$anchor, div_1);
		};

		$.if(node_1, ($$render) => {
			if (props().hasFakeCaret) $$render(consequent_1);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(div, 'data-testid', `cell-${idx() ?? ''}`);
		$.set_attribute(div, 'data-active', props().isActive ? "" : undefined);
	});

	$.append($$anchor, div);
};

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'onComplete',
	'maxlength',
	'value',
	'toCopy'
]);

var root = $.from_html(`<div class="animate-caret-blink pointer-events-none absolute inset-0 flex items-center justify-center"><div class="h-8 w-px bg-white"></div></div>`);
var root_1 = $.from_html(`<div><!> <!></div>`);
var root_2 = $.from_html(`<div class="flex"></div> <div class="flex w-10 items-center justify-center"><div class="bg-border h-1 w-3 rounded-full"></div></div> <div class="flex"></div>`, 1);
var root_3 = $.from_html(`<main><button aria-label="binding" data-testid="binding"> </button> <button type="button" data-testid="focus-input">focus input</button> <!> <div data-testid="to-copy"> </div></main>`);

export default function Pin_input_test($$anchor, $$props) {
	let onComplete = $.prop($$props, 'onComplete', 3, () => {}),
		maxlength = $.prop($$props, 'maxlength', 3, 6),
		value = $.prop($$props, 'value', 7, ""),
		restProps = $.rest_props($$props, rest_excludes);

	let inputRef = $.state(null);
	var main = root_3();
	var button = $.child(main);
	var text_1 = $.only_child(button, true);
	var button_1 = $.sibling(button, 2);
	var node_2 = $.sibling(button_1, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let cells = () => ($$arg0?.()).cells;
			let _isFocused = () => ($$arg0?.()).isFocused;
			let _isHovering = () => ($$arg0?.()).isHovering;
			var fragment_1 = root_2();
			var div_2 = $.first_child(fragment_1);

			$.each(div_2, 21, () => cells().slice(0, 3), $.index, ($$anchor, cell, idx) => {
				Cell($$anchor, () => $.get(cell), () => idx);
			});

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 4);

			$.each(div_3, 21, () => cells().slice(3, 6), $.index, ($$anchor, cell, idx) => {
				Cell($$anchor, () => $.get(cell), () => idx + 3);
			});

			$.reset(div_3);
			$.append($$anchor, fragment_1);
		};

		$.component(node_2, () => PinInput.Root, ($$anchor, PinInput_Root) => {
			PinInput_Root($$anchor, $.spread_props(
				{
					'aria-label': 'my input',
					inputId: 'myInput',
					class: 'group/pininput text-foreground flex items-center has-[:disabled]:opacity-30',
					get maxlength() {
						return maxlength();
					},

					get onComplete() {
						return onComplete();
					},
					'data-testid': 'input'
				},
				() => restProps,
				{
					get inputRef() {
						return $.get(inputRef);
					},

					set inputRef($$value) {
						$.set(inputRef, $$value, true);
					},

					get value() {
						return value();
					},

					set value($$value) {
						value($$value);
					},
					children,
					$$slots: { default: true }
				}
			));
		});
	}

	var div_4 = $.sibling(node_2, 2);
	var text_2 = $.only_child(div_4, true);

	$.reset(main);

	$.template_effect(() => {
		$.set_text(text_1, value());
		$.set_text(text_2, $$props.toCopy);
	});

	$.delegated('click', button, () => value("999999"));
	$.delegated('click', button_1, () => $.get(inputRef)?.focus());
	$.append($$anchor, main);
}

$.delegate(['click']);