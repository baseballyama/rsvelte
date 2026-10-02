import * as $ from 'svelte/internal/server';
import CountrySelector from './country-selector.svelte';
import { cn } from '$lib/utils.js';
import { TelInput, countries } from 'svelte-tel-input';
import 'svelte-tel-input/styles/flags.css';

export const defaultOptions = { spaces: true, autoPlaceholder: true };

export default function Phone_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className = undefined,
			defaultCountry = null,
			country = defaultCountry,
			options = defaultOptions,
			placeholder,
			readonly = false,
			disabled = false,
			value = '',
			valid = true,
			detailedValue = null,
			order = undefined,
			name = undefined,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let el = void 0;

		function focus() {
			// sort of an after update kinda thing
			setTimeout(
				() => {
					el?.focus();
				},
				0
			);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex place-items-center">`);

			CountrySelector($$renderer, {
				order,
				countries,
				onselect: focus,
				get selected() {
					return country;
				},

				set selected($$value) {
					country = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			TelInput($$renderer, $.spread_props([
				{
					name,
					readonly,
					disabled,
					placeholder,
					options,
					class: cn('border-input border-l-none bg-background selection:bg-primary dark:bg-input/30 selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground flex h-9 w-full min-w-0 rounded-l-none rounded-r-md border-y border-r px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]', 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive', className)
				},
				rest,
				{
					get country() {
						return country;
					},

					set country($$value) {
						country = $$value;
						$$settled = false;
					},

					get detailedValue() {
						return detailedValue;
					},

					set detailedValue($$value) {
						detailedValue = $$value;
						$$settled = false;
					},

					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					},

					get valid() {
						return valid;
					},

					set valid($$value) {
						valid = $$value;
						$$settled = false;
					},

					get el() {
						return el;
					},

					set el($$value) {
						el = $$value;
						$$settled = false;
					}
				}
			]));

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { country, value, valid, detailedValue });
	});
}