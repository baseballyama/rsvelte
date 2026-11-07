import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { on } from 'svelte/events';
import { classMap, exclude, prefixFilter, useActions, dispatch } from '@smui/common/internal';
import Autocomplete from '@smui-extra/autocomplete';
import Textfield, { Input } from '@smui/textfield';
import FloatingLabel from '@smui/floating-label';
import LineRipple from '@smui/line-ripple';
import Chip, { ChipSet, TrailingAction, Text as ChipText } from '@smui/chips';
import { Text as ListText } from '@smui/list';

export default function ChipInput($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * An array of chip objects.
		 */
		/**
		 * Function that takes a chip object and returns a unique string.
		 *
		 * If your chips are strings or convert to unique strings (like numbers),
		 * you don't need this.
		 */
		/**
		 * Get the label that will go on the chip itself.
		 */
		/**
		 * Get the text that will go in the autocomplete when the chip is clicked.
		 */
		/**
		 * The value of the autocomplete input.
		 */
		/**
		 * The text of the autocomplete input.
		 */
		/**
		 * Whether the input is disabled.
		 */
		/**
		 * The keys that result in a chip being added when pressed.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * Allow the user to enter their own value as well as pick from the options.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * A spot for the chips' trailing action.
		 */
		/**
		 * A spot for the label.
		 */
		/**
		 * A spot for the item text when the results are loading.
		 */
		let {
			use = [],
			class: className = '',
			chips = void 0,
			key,
			getChipLabel = (chip) => `${chip}`,
			getChipText = (chip) => `${chip}`,
			value = void 0,
			text = '',
			disabled = false,
			addChipKeys = [','],
			chipSet$class = '',
			autocomplete$class = '',
			autocomplete$combobox = false,
			textfield$class = '',
			loading$class = '',
			chipTrailingAction,
			label: labelSnippet,
			loading,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let autocomplete = void 0;
		let input = void 0;
		let floatingLabel = void 0;
		let lineRipple = void 0;
		let previousValue = value;
		const chipSetProps = $.derived(() => ({ ...key != null ? { key } : {} }));

		onMount(() => {
			const el = input?.getElement();

			if (el) {
				return on(
					el,
					'keydown',
					(e) => {
						handleInputKeydown(e);
						restProps.input$onkeydown?.(e);
					},
					{ passive: false }
				);
			}
		});

		function handleAutocompleteSelected(event) {
			event.preventDefault();

			// Clear the text to not trigger an entry event on blur.
			text = '';

			if (document.activeElement !== input?.getElement()) {
				floatingLabel?.float(false);
			}

			const selectEvent = dispatch(getElement(), 'SMUIChipInputSelect', event.detail, { bubbles: true, cancelable: true });

			if (!selectEvent.defaultPrevented) {
				if (chips.findIndex((chip) => chip === event.detail) === -1) {
					chips.push(event.detail);
				}
			}
		}

		function handleInputKeydown(event) {
			if (autocomplete$combobox && (event.key === 'Enter' || addChipKeys.includes(event.key)) && text && input?.getElement().validity.valid) {
				event.preventDefault();

				const entryEvent = dispatch(getElement(), 'SMUIChipInputEntry', { text }, { bubbles: true, cancelable: true });

				if (!entryEvent.defaultPrevented) {
					if (chips.findIndex((chip) => chip === text) === -1) {
						chips.push(text);
					}

					text = '';
				}
			}
		}

		function handleAutocompleteFocusout(event) {
			if (!autocomplete || !autocomplete.getElement() || autocomplete.getElement().contains(event.relatedTarget)) {
				return;
			}

			if (autocomplete$combobox && text && input?.getElement().validity.valid) {
				const entryEvent = dispatch(getElement(), 'SMUIChipInputEntry', { text }, { bubbles: true, cancelable: true });

				if (!entryEvent.defaultPrevented) {
					if (chips.findIndex((chip) => chip === text) === -1) {
						chips.push(text);
					}

					text = '';
					floatingLabel?.float(false);
				}
			}
		}

		function handleChipInteraction(chip) {
			if (!disabled) {
				chips = chips.filter((curChip) => key ? key(curChip) !== key(chip) : curChip !== chip);
				text = getChipText(chip);
				input?.focus();
			}
		}

		function handleChipRemoval(chip) {
			dispatch(getElement(), 'SMUIChipInputRemove', { chip });
		}

		function focus() {
			input?.focus();
		}

		function blur() {
			input?.blur();
		}

		function getElement() {
			return element;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attributes({
				class: $.clsx(classMap({
					'smui-chip-input': true,
					'smui-chip-input--disabled': disabled,
					[className]: true
				})),

				...exclude(restProps, [
					'chipSet$',
					'chip$',
					'chipText$',
					'chipTrailingAction$',
					'autocomplete$',
					'textfield$',
					'label$',
					'input$',
					'loading$',
					'ripple$'
				])
			})}>`);

			{
				function chip($$renderer, chip) {
					Chip($$renderer, $.spread_props([
						{ chip },
						prefixFilter(restProps, 'chip$'),
						{
							onSMUIChipInteraction: (e) => {
								handleChipInteraction(chip);
								restProps.chip$onSMUIChipInteraction?.(e);
							},

							onSMUIChipRemoval: (e) => {
								handleChipRemoval(chip);
								restProps.chip$onSMUIChipRemoval?.(e);
							},

							children: ($$renderer) => {
								ChipText($$renderer, $.spread_props([
									prefixFilter(restProps, 'chipText$'),
									{
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(getChipLabel(chip))}`);
										},
										$$slots: { default: true }
									}
								]));

								$$renderer.push(`<!----> `);

								TrailingAction($$renderer, $.spread_props([
									prefixFilter(restProps, 'chipTrailingAction$'),
									{
										children: ($$renderer) => {
											chipTrailingAction?.($$renderer);
											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									}
								]));

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						}
					]));
				}

				ChipSet($$renderer, $.spread_props([
					{
						class: classMap({ 'smui-chip-input__chip-set': true, [chipSet$class]: true }),
						input: true,
						nonInteractive: disabled
					},
					chipSetProps(),
					prefixFilter(restProps, 'chipSet$'),
					{
						get chips() {
							return chips;
						},

						set chips($$value) {
							chips = $$value;
							$$settled = false;
						},
						chip,
						$$slots: { chip: true }
					}
				]));
			}

			$$renderer.push(`<!----> `);

			{
				function loading($$renderer) {
					ListText($$renderer, $.spread_props([
						{
							class: classMap({ 'smui-chip-input__loading': true, [loading$class]: true })
						},
						prefixFilter(restProps, 'loading$'),
						{
							children: ($$renderer) => {
								loading?.($$renderer);
							},
							$$slots: { default: true }
						}
					]));
				}

				Autocomplete($$renderer, $.spread_props([
					{
						class: classMap({
							'smui-chip-input__autocomplete': true,
							[autocomplete$class]: true
						}),
						combobox: autocomplete$combobox,
						showMenuWithNoInput: false
					},
					prefixFilter(restProps, 'autocomplete$'),
					{
						onSMUIAutocompleteSelected: (e) => {
							handleAutocompleteSelected(e);
							restProps.autocomplete$onSMUIAutocompleteSelected?.(e);
						},

						onfocusout: (e) => {
							handleAutocompleteFocusout(e);
							restProps.autocomplete$onfocusout?.(e);
						},

						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},

						get text() {
							return text;
						},

						set text($$value) {
							text = $$value;
							$$settled = false;
						},
						loading,
						children: ($$renderer) => {
							{
								function label($$renderer) {
									FloatingLabel($$renderer, $.spread_props([
										prefixFilter(restProps, 'label$'),
										{
											children: ($$renderer) => {
												labelSnippet?.($$renderer);
												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										}
									]));
								}

								Textfield($$renderer, $.spread_props([
									{
										class: classMap({ 'smui-chip-input__textfield': true, [textfield$class]: true }),
										input,
										floatingLabel,
										lineRipple
									},
									prefixFilter(restProps, 'textfield$'),
									{
										label,
										children: ($$renderer) => {
											Input($$renderer, $.spread_props([
												prefixFilter(restProps, 'input$'),
												{
													get value() {
														return text;
													},

													set value($$value) {
														text = $$value;
														$$settled = false;
													}
												}
											]));
										},
										$$slots: { label: true, default: true }
									}
								]));
							}
						},
						$$slots: { loading: true, default: true }
					}
				]));
			}

			$$renderer.push(`<!----> `);
			LineRipple($$renderer, $.spread_props([prefixFilter(restProps, 'ripple$')]));
			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { chips, value, text, focus, blur, getElement });
	});
}