import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import Input from './ipv4address-input-input.svelte';
import { safeParseIPv4Address } from '.';
import { isNumber } from '$lib/utils/is-number';
import * as ipv4address from '$lib/utils/ipv4-address';

export default function Ipv4address_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			separator = '.',
			value = null,
			placeholder,
			class: className,
			name,
			valid = false
		} = $$props;

		const parsedPlaceholder = $.derived(() => safeParseIPv4Address(placeholder));
		let firstInput = void 0;
		let secondInput = void 0;
		let thirdInput = void 0;
		let fourthInput = void 0;
		const octets = $.derived(() => safeParseIPv4Address(value ?? '') ?? [0, 0, 0, 0]);

		const paste = (e) => {
			const data = e.clipboardData?.getData('text');

			if (!data) return;

			const parsed = safeParseIPv4Address(data);

			if (!parsed) return;

			// validates each octet if invalid then sets to null
			octets()[0] = validate(parsed[0]);

			octets()[1] = validate(parsed[1]);
			octets()[2] = validate(parsed[2]);
			octets()[3] = validate(parsed[3]);
		};

		const validate = (octet) => {
			if (octet == null) return null;
			if (!isNumber(octet)) return null;

			const val = parseInt(octet);

			if (val < 0 || val > 255) return null;

			return val;
		};

		const format = (octets) => octets.join(separator);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			var bind_get = () => octets()[0];

			var bind_set = (v) => {
				const tempOctets = octets();

				if (v == null || v === '') {
					tempOctets[0] = null;
				} else {
					tempOctets[0] = v;
				}

				value = format(tempOctets);
			};

			var bind_get_1 = () => octets()[1];

			var bind_set_1 = (v) => {
				const tempOctets = octets();

				if (v == null || v === '') {
					tempOctets[1] = null;
				} else {
					tempOctets[1] = v;
				}

				value = format(tempOctets);
			};

			var bind_get_2 = () => octets()[2];

			var bind_set_2 = (v) => {
				const tempOctets = octets();

				if (v == null || v === '') {
					tempOctets[2] = null;
				} else {
					tempOctets[2] = v;
				}

				value = format(tempOctets);
			};

			var bind_get_3 = () => octets()[3];

			var bind_set_3 = (v) => {
				const tempOctets = octets();

				if (v == null || v === '') {
					tempOctets[3] = null;
				} else {
					tempOctets[3] = v;
				}

				value = format(tempOctets);
			};

			$$renderer.push(`<div${$.attr('aria-invalid', !valid)}${$.attr_class($.clsx(cn('ring-offset-background border-input bg-background selection:bg-primary dark:bg-input/30 focus-within:ring-ring flex h-9 w-fit place-items-center rounded-md border px-3 font-mono font-light ring-2 ring-transparent focus-within:ring-offset-2', className)))}>`);

			Input($$renderer, {
				goNext: () => secondInput?.focus(),
				get value() {
					return bind_get();
				},

				set value($$value) {
					bind_set($$value);
				},
				placeholder: parsedPlaceholder() ? parsedPlaceholder()[0] : undefined,
				onpaste: paste,
				get ref() {
					return firstInput;
				},

				set ref($$value) {
					firstInput = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <span class="font-mono">${$.escape(separator)}</span> `);

			Input($$renderer, {
				tabindex: -1,
				goNext: () => thirdInput?.focus(),
				goPrevious: () => firstInput?.focus(),
				get value() {
					return bind_get_1();
				},

				set value($$value) {
					bind_set_1($$value);
				},
				placeholder: parsedPlaceholder() ? parsedPlaceholder()[1] : undefined,
				onpaste: paste,
				get ref() {
					return secondInput;
				},

				set ref($$value) {
					secondInput = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <span class="font-mono">${$.escape(separator)}</span> `);

			Input($$renderer, {
				tabindex: -1,
				goNext: () => fourthInput?.focus(),
				goPrevious: () => secondInput?.focus(),
				get value() {
					return bind_get_2();
				},

				set value($$value) {
					bind_set_2($$value);
				},
				placeholder: parsedPlaceholder() ? parsedPlaceholder()[2] : undefined,
				onpaste: paste,
				get ref() {
					return thirdInput;
				},

				set ref($$value) {
					thirdInput = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <span class="font-mono">${$.escape(separator)}</span> `);

			Input($$renderer, {
				tabindex: -1,
				goPrevious: () => thirdInput?.focus(),
				get value() {
					return bind_get_3();
				},

				set value($$value) {
					bind_set_3($$value);
				},
				placeholder: parsedPlaceholder() ? parsedPlaceholder()[3] : undefined,
				onpaste: paste,
				get ref() {
					return fourthInput;
				},

				set ref($$value) {
					fourthInput = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <input class="hidden"${$.attr('tabindex', -1)}${$.attr('name', name)}${$.attr('value', value)}/>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { value, valid });
	});
}