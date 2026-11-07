import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CountrySelector from './country-selector.svelte';
import { cn } from '$lib/utils.js';
import { TelInput, countries } from 'svelte-tel-input';
import 'svelte-tel-input/styles/flags.css';

export const defaultOptions = { spaces: true, autoPlaceholder: true };

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'defaultCountry',
	'country',
	'options',
	'placeholder',
	'readonly',
	'disabled',
	'value',
	'valid',
	'detailedValue',
	'order',
	'name'
]);

var root = $.from_html(`<div class="flex place-items-center"><!> <!></div>`);

export default function Phone_input($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, undefined),
		defaultCountry = $.prop($$props, 'defaultCountry', 3, null),
		country = $.prop($$props, 'country', 31, () => $.proxy(defaultCountry())),
		options = $.prop($$props, 'options', 3, defaultOptions),
		readonly = $.prop($$props, 'readonly', 3, false),
		disabled = $.prop($$props, 'disabled', 3, false),
		value = $.prop($$props, 'value', 15, ''),
		valid = $.prop($$props, 'valid', 15, true),
		detailedValue = $.prop($$props, 'detailedValue', 15, null),
		order = $.prop($$props, 'order', 3, undefined),
		name = $.prop($$props, 'name', 3, undefined),
		rest = $.rest_props($$props, rest_excludes);

	let el = $.state(void 0);

	function focus() {
		// sort of an after update kinda thing
		setTimeout(
			() => {
				$.get(el)?.focus();
			},
			0
		);
	}

	var div = root();
	var node = $.child(div);

	CountrySelector(node, {
		get order() {
			return order();
		},

		get countries() {
			return countries;
		},
		onselect: focus,
		get selected() {
			return country();
		},

		set selected($$value) {
			country($$value);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => cn('border-input border-l-none bg-background selection:bg-primary dark:bg-input/30 selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground flex h-9 w-full min-w-0 rounded-l-none rounded-r-md border-y border-r px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]', 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive', className()));

		TelInput(node_1, $.spread_props(
			{
				get name() {
					return name();
				},

				get readonly() {
					return readonly();
				},

				get disabled() {
					return disabled();
				},

				get placeholder() {
					return $$props.placeholder;
				},

				get options() {
					return options();
				},

				get class() {
					return $.get($0);
				}
			},
			() => rest,
			{
				get country() {
					return country();
				},

				set country($$value) {
					country($$value);
				},

				get detailedValue() {
					return detailedValue();
				},

				set detailedValue($$value) {
					detailedValue($$value);
				},

				get value() {
					return value();
				},

				set value($$value) {
					value($$value);
				},

				get valid() {
					return valid();
				},

				set valid($$value) {
					valid($$value);
				},

				get el() {
					return $.get(el);
				},

				set el($$value) {
					$.set(el, $$value, true);
				}
			}
		));
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}