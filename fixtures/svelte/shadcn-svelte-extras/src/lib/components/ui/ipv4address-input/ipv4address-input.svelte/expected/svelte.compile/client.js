import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import Input from './ipv4address-input-input.svelte';
import { safeParseIPv4Address } from '.';
import { isNumber } from '$lib/utils/is-number';
import * as ipv4address from '$lib/utils/ipv4-address';

var root = $.from_html(`<div><!> <span class="font-mono"> </span> <!> <span class="font-mono"> </span> <!> <span class="font-mono"> </span> <!></div> <input class="hidden"/>`, 1);

export default function Ipv4address_input($$anchor, $$props) {
	$.push($$props, true);

	let separator = $.prop($$props, 'separator', 3, '.'),
		value = $.prop($$props, 'value', 15, null),
		valid = $.prop($$props, 'valid', 15, false);

	const parsedPlaceholder = $.derived(() => safeParseIPv4Address($$props.placeholder));
	let firstInput = $.state(void 0);
	let secondInput = $.state(void 0);
	let thirdInput = $.state(void 0);
	let fourthInput = $.state(void 0);
	const octets = $.derived(() => safeParseIPv4Address(value() ?? '') ?? [0, 0, 0, 0]);

	const paste = (e) => {
		const data = e.clipboardData?.getData('text');

		if (!data) return;

		const parsed = safeParseIPv4Address(data);

		if (!parsed) return;

		// validates each octet if invalid then sets to null
		$.get(octets)[0] = validate(parsed[0]);

		$.get(octets)[1] = validate(parsed[1]);
		$.get(octets)[2] = validate(parsed[2]);
		$.get(octets)[3] = validate(parsed[3]);
	};

	const validate = (octet) => {
		if (octet == null) return null;
		if (!isNumber(octet)) return null;

		const val = parseInt(octet);

		if (val < 0 || val > 255) return null;

		return val;
	};

	const format = (octets) => octets.join(separator());

	$.user_effect(() => {
		valid(ipv4address.parse(value() ?? '').isOk());
	});

	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);
	var bind_get = () => $.get(octets)[0];

	var bind_set = (v) => {
		const tempOctets = $.get(octets);

		if (v == null || v === '') {
			tempOctets[0] = null;
		} else {
			tempOctets[0] = v;
		}

		value(format(tempOctets));
	};

	{
		let $0 = $.derived(() => $.get(parsedPlaceholder) ? $.get(parsedPlaceholder)[0] : undefined);

		Input(node, {
			goNext: () => $.get(secondInput)?.focus(),
			get value() {
				return bind_get();
			},

			set value($$value) {
				bind_set($$value);
			},

			get placeholder() {
				return $.get($0);
			},
			onpaste: paste,
			get ref() {
				return $.get(firstInput);
			},

			set ref($$value) {
				$.set(firstInput, $$value, true);
			}
		});
	}

	var span = $.sibling(node, 2);
	var text = $.only_child(span, true);
	var node_1 = $.sibling(span, 2);
	var bind_get_1 = () => $.get(octets)[1];

	var bind_set_1 = (v) => {
		const tempOctets = $.get(octets);

		if (v == null || v === '') {
			tempOctets[1] = null;
		} else {
			tempOctets[1] = v;
		}

		value(format(tempOctets));
	};

	{
		let $0 = $.derived(() => $.get(parsedPlaceholder) ? $.get(parsedPlaceholder)[1] : undefined);

		Input(node_1, {
			tabindex: -1,
			goNext: () => $.get(thirdInput)?.focus(),
			goPrevious: () => $.get(firstInput)?.focus(),
			get value() {
				return bind_get_1();
			},

			set value($$value) {
				bind_set_1($$value);
			},

			get placeholder() {
				return $.get($0);
			},
			onpaste: paste,
			get ref() {
				return $.get(secondInput);
			},

			set ref($$value) {
				$.set(secondInput, $$value, true);
			}
		});
	}

	var span_1 = $.sibling(node_1, 2);
	var text_1 = $.only_child(span_1, true);
	var node_2 = $.sibling(span_1, 2);
	var bind_get_2 = () => $.get(octets)[2];

	var bind_set_2 = (v) => {
		const tempOctets = $.get(octets);

		if (v == null || v === '') {
			tempOctets[2] = null;
		} else {
			tempOctets[2] = v;
		}

		value(format(tempOctets));
	};

	{
		let $0 = $.derived(() => $.get(parsedPlaceholder) ? $.get(parsedPlaceholder)[2] : undefined);

		Input(node_2, {
			tabindex: -1,
			goNext: () => $.get(fourthInput)?.focus(),
			goPrevious: () => $.get(secondInput)?.focus(),
			get value() {
				return bind_get_2();
			},

			set value($$value) {
				bind_set_2($$value);
			},

			get placeholder() {
				return $.get($0);
			},
			onpaste: paste,
			get ref() {
				return $.get(thirdInput);
			},

			set ref($$value) {
				$.set(thirdInput, $$value, true);
			}
		});
	}

	var span_2 = $.sibling(node_2, 2);
	var text_2 = $.only_child(span_2, true);
	var node_3 = $.sibling(span_2, 2);
	var bind_get_3 = () => $.get(octets)[3];

	var bind_set_3 = (v) => {
		const tempOctets = $.get(octets);

		if (v == null || v === '') {
			tempOctets[3] = null;
		} else {
			tempOctets[3] = v;
		}

		value(format(tempOctets));
	};

	{
		let $0 = $.derived(() => $.get(parsedPlaceholder) ? $.get(parsedPlaceholder)[3] : undefined);

		Input(node_3, {
			tabindex: -1,
			goPrevious: () => $.get(thirdInput)?.focus(),
			get value() {
				return bind_get_3();
			},

			set value($$value) {
				bind_set_3($$value);
			},

			get placeholder() {
				return $.get($0);
			},
			onpaste: paste,
			get ref() {
				return $.get(fourthInput);
			},

			set ref($$value) {
				$.set(fourthInput, $$value, true);
			}
		});
	}

	$.reset(div);

	var input = $.sibling(div, 2);

	$.remove_input_defaults(input);
	$.set_attribute(input, 'tabindex', -1);

	$.template_effect(
		($0) => {
			$.set_attribute(div, 'aria-invalid', !valid());
			$.set_class(div, 1, $0);
			$.set_text(text, separator());
			$.set_text(text_1, separator());
			$.set_text(text_2, separator());
			$.set_attribute(input, 'name', $$props.name);
			$.set_value(input, value());
		},
		[
			() => $.clsx(cn('ring-offset-background border-input bg-background selection:bg-primary dark:bg-input/30 focus-within:ring-ring flex h-9 w-fit place-items-center rounded-md border px-3 font-mono font-light ring-2 ring-transparent focus-within:ring-offset-2', $$props.class))
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}