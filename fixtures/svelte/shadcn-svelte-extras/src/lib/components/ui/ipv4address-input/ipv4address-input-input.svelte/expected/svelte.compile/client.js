import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { isNumber } from '$lib/utils/is-number';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'goPrevious',
	'goNext',
	'ref',
	'class'
]);

var root = $.from_html(`<input/>`);

export default function Ipv4address_input_input($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, null),
		ref = $.prop($$props, 'ref', 15),
		rest = $.rest_props($$props, rest_excludes);

	/** Runs after input (this is here because safari/firefox treat the `setTimeout` function differently than chrome) */
	let after = undefined;

	const onKeydown = (e) => {
		if (e.ctrlKey || e.metaKey) return;

		// just continue as normal
		if (e.key == 'Tab' || e.key == 'Delete') return;

		// for backspace we goPrevious if the value is empty
		if (e.key == 'Backspace') {
			if (value() == null || value().toString().length == 0) {
				// the 2 ensures consistent behavior in all browsers
				setTimeout(() => $$props.goPrevious?.(), 2);
			}

			return;
		}

		// we want to go forward for `.` or ` `
		if (['.', ' '].includes(e.key) && !e.ctrlKey && !e.metaKey) {
			e.preventDefault();
			$$props.goNext?.();

			return;
		}

		const target = e.target;

		if (e.key == 'ArrowRight') {
			// only go to next box if at end
			if (target.selectionStart == target.value.length) {
				e.preventDefault();
				$$props.goNext?.();
			}

			return;
		}

		if (e.key == 'ArrowLeft') {
			// only go to previous box if at start
			if (target.selectionStart == 0) {
				e.preventDefault();
				$$props.goPrevious?.();
			}

			return;
		}

		// disallow any non numbers
		// By default this prevents any undefined behavior
		// so make sure anything that can happen is defined.
		if (!isNumber(e.key)) {
			e.preventDefault();

			return;
		}

		const newValue = e.target.value + e.key;

		if (newValue.length > 3) {
			e.preventDefault();
			$$props.goNext?.();

			return;
		}

		const integerValue = parseInt(newValue);

		// we will try to advance if its greater
		if (integerValue > 255) {
			e.preventDefault();
			$$props.goNext?.();

			return;
		}

		// this should be impossible but in any case
		if (integerValue < 0) {
			e.preventDefault();

			return;
		}

		if (newValue.length == 3) {
			// go next after input
			after = () => $$props.goNext?.();

			return;
		}
	};

	const onInput = () => {
		after?.();
		after = undefined;
	};

	var input = root();

	$.attribute_effect(
		input,
		($0) => ({
			min: 0,
			max: 255,
			maxlength: 3,
			oninput: onInput,
			onkeydown: onKeydown,
			type: 'text',
			class: $0,
			...rest
		}),
		[
			() => cn('hide-ramp placeholder:text-muted-foreground h-full w-9 border-0 bg-transparent text-center outline-hidden focus:outline-hidden', $$props.class)
		],
		void 0,
		void 0,
		'svelte-4rkmot',
		true
	);

	$.bind_this(input, ($$value) => ref($$value), () => ref());
	$.bind_value(input, value);
	$.append($$anchor, input);
	$.pop();
}