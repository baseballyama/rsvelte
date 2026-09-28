import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="space-y-1"><button type="button"><div class="aspect-4/3 w-[70%] bg-primary-500/30 border-t-4 border-l-4 border-primary-500"></div></button> <div class="text-[10px] text-center"> </div></div>`);

export default function EdgeOption($$anchor, $$props) {
	$.push($$props, true);

	// A fixed radius used to demonstrate corner-shape options, independent of the actual radius setting.
	const DEMO_CORNER_RADIUS = '1rem';

	let mode = $.prop($$props, 'mode', 3, 'radius');

	function handleOnClick() {
		$$props.onselect($$props.value);
	}

	// Reactive
	let rxActive = $.derived(() => $$props.value === $$props.active
		? `preset-tonal-primary border-surface-950-50`
		: `border-surface-300-700 hover:border-surface-500`);

	let rxStyles = $.derived(() => mode() === 'thickness'
		? `border-top-width: ${$$props.value}; border-left-width: ${$$props.value}`
		: mode() === 'corner'
			? `border-top-left-radius: ${DEMO_CORNER_RADIUS}; corner-shape: ${$$props.value}`
			: `border-top-left-radius: ${$$props.value}`);

	var div = root();
	var button = $.child(div);
	var div_1 = $.only_child(button);
	var div_2 = $.sibling(button, 2);
	var text = $.only_child(div_2, true);

	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_attribute(button, 'aria-label', `edge-option-${$$props.value ?? ''}`);
			$.set_class(button, 1, `border-1! ${$.get(rxActive) ?? ''} aspect-4/3 w-full flex justify-end items-end rounded-sm overflow-hidden`);
			$.set_style(div_1, $.get(rxStyles));
			$.set_text(text, $0);
		},
		[() => $$props.value.replace('0.', '.')]
	);

	$.delegated('click', button, handleOnClick);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);