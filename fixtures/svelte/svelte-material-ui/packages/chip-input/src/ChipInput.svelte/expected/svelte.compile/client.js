import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { on } from 'svelte/events';
import { classMap, exclude, prefixFilter, useActions, dispatch } from '@smui/common/internal';
import Autocomplete from '@smui-extra/autocomplete';
import Textfield, { Input } from '@smui/textfield';
import FloatingLabel from '@smui/floating-label';
import LineRipple from '@smui/line-ripple';
import Chip, { ChipSet, TrailingAction, Text as ChipText } from '@smui/chips';
import { Text as ListText } from '@smui/list';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'chips',
	'key',
	'getChipLabel',
	'getChipText',
	'value',
	'text',
	'disabled',
	'addChipKeys',
	'chipSet$class',
	'autocomplete$class',
	'autocomplete$combobox',
	'textfield$class',
	'loading$class',
	'chipTrailingAction',
	'label',
	'loading'
]);

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><!> <!> <!></div>`);

export default function ChipInput($$anchor, $$props) {
	$.push($$props, true);

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
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		chips = $.prop($$props, 'chips', 15),
		getChipLabel = $.prop($$props, 'getChipLabel', 3, (chip) => `${chip}`),
		getChipText = $.prop($$props, 'getChipText', 3, (chip) => `${chip}`),
		value = $.prop($$props, 'value', 15),
		text = $.prop($$props, 'text', 15, ''),
		disabled = $.prop($$props, 'disabled', 3, false),
		addChipKeys = $.prop($$props, 'addChipKeys', 19, () => [',']),
		chipSet$class = $.prop($$props, 'chipSet$class', 3, ''),
		autocomplete$class = $.prop($$props, 'autocomplete$class', 3, ''),
		autocomplete$combobox = $.prop($$props, 'autocomplete$combobox', 3, false),
		textfield$class = $.prop($$props, 'textfield$class', 3, ''),
		loading$class = $.prop($$props, 'loading$class', 3, ''),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let autocomplete = $.state(void 0);
	let input = $.state(void 0);
	let floatingLabel = $.state(void 0);
	let lineRipple = $.state(void 0);
	let previousValue = value();

	$.user_effect(() => {
		if (previousValue !== value()) {
			if (previousValue && value() == null) {
				text('');
			}

			previousValue = value();
		}
	});

	$.user_effect(() => {
		if (text() === '' && $.get(floatingLabel) && $.get(input) && document.activeElement !== $.get(input).getElement()) {
			$.get(floatingLabel).float(false);
		}
	});

	const chipSetProps = $.derived(() => ({ ...$$props.key != null ? { key: $$props.key } : {} }));

	onMount(() => {
		const el = $.get(input)?.getElement();

		if (el) {
			return on(
				el,
				'keydown',
				(e) => {
					handleInputKeydown(e);
					$$props.input$onkeydown?.(e);
				},
				{ passive: false }
			);
		}
	});

	function handleAutocompleteSelected(event) {
		event.preventDefault();

		// Clear the text to not trigger an entry event on blur.
		text('');

		if (document.activeElement !== $.get(input)?.getElement()) {
			$.get(floatingLabel)?.float(false);
		}

		const selectEvent = dispatch(getElement(), 'SMUIChipInputSelect', event.detail, { bubbles: true, cancelable: true });

		if (!selectEvent.defaultPrevented) {
			if (chips().findIndex((chip) => chip === event.detail) === -1) {
				chips().push(event.detail);
			}
		}
	}

	function handleInputKeydown(event) {
		if (autocomplete$combobox() && (event.key === 'Enter' || addChipKeys().includes(event.key)) && text() && $.get(input)?.getElement().validity.valid) {
			event.preventDefault();

			const entryEvent = dispatch(getElement(), 'SMUIChipInputEntry', { text: text() }, { bubbles: true, cancelable: true });

			if (!entryEvent.defaultPrevented) {
				if (chips().findIndex((chip) => chip === text()) === -1) {
					chips().push(text());
				}

				text('');
			}
		}
	}

	function handleAutocompleteFocusout(event) {
		if (!$.get(autocomplete) || !$.get(autocomplete).getElement() || $.get(autocomplete).getElement().contains(event.relatedTarget)) {
			return;
		}

		if (autocomplete$combobox() && text() && $.get(input)?.getElement().validity.valid) {
			const entryEvent = dispatch(getElement(), 'SMUIChipInputEntry', { text: text() }, { bubbles: true, cancelable: true });

			if (!entryEvent.defaultPrevented) {
				if (chips().findIndex((chip) => chip === text()) === -1) {
					chips().push(text());
				}

				text('');
				$.get(floatingLabel)?.float(false);
			}
		}
	}

	function handleChipInteraction(chip) {
		if (!disabled()) {
			chips(chips().filter((curChip) => $$props.key
				? $$props.key(curChip) !== $$props.key(chip)
				: curChip !== chip));

			text(getChipText()(chip));
			$.get(input)?.focus();
		}
	}

	function handleChipRemoval(chip) {
		dispatch(getElement(), 'SMUIChipInputRemove', { chip });
	}

	function focus() {
		$.get(input)?.focus();
	}

	function blur() {
		$.get(input)?.blur();
	}

	function getElement() {
		return element;
	}

	var $$exports = { focus, blur, getElement };
	var div = root_1();

	$.attribute_effect(div, ($0, $1) => ({ class: $0, ...$1 }), [
		() => classMap({
			'smui-chip-input': true,
			'smui-chip-input--disabled': disabled(),
			[className()]: true
		}),

		() => exclude(restProps, [
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
	]);

	var node = $.child(div);

	{
		const chip = ($$anchor, chip = $.noop) => {
			{
				let $0 = $.derived(() => prefixFilter(restProps, 'chip$'));

				Chip($$anchor, $.spread_props(
					{
						get chip() {
							return chip();
						}
					},
					() => $.get($0),
					{
						onSMUIChipInteraction: (e) => {
							handleChipInteraction(chip());
							$$props.chip$onSMUIChipInteraction?.(e);
						},

						onSMUIChipRemoval: (e) => {
							handleChipRemoval(chip());
							$$props.chip$onSMUIChipRemoval?.(e);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_1 = $.first_child(fragment_1);

							{
								let $0 = $.derived(() => prefixFilter(restProps, 'chipText$'));

								ChipText(node_1, $.spread_props(() => $.get($0), {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(($0) => $.set_text(text_1, $0), [() => getChipLabel()(chip())]);
										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								}));
							}

							var node_2 = $.sibling(node_1, 2);

							{
								let $0 = $.derived(() => prefixFilter(restProps, 'chipTrailingAction$'));

								TrailingAction(node_2, $.spread_props(() => $.get($0), {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_3 = $.first_child(fragment_3);

										$.snippet(node_3, () => $$props.chipTrailingAction ?? $.noop);
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								}));
							}

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					}
				));
			}
		};

		let $0 = $.derived(() => classMap({ 'smui-chip-input__chip-set': true, [chipSet$class()]: true }));
		let $1 = $.derived(() => prefixFilter(restProps, 'chipSet$'));

		ChipSet(node, $.spread_props(
			{
				get class() {
					return $.get($0);
				},
				input: true,
				get nonInteractive() {
					return disabled();
				}
			},
			() => $.get(chipSetProps),
			() => $.get($1),
			{
				get chips() {
					return chips();
				},

				set chips($$value) {
					chips($$value);
				},
				chip,
				$$slots: { chip: true }
			}
		));
	}

	var node_4 = $.sibling(node, 2);

	{
		const loading = ($$anchor) => {
			{
				let $0 = $.derived(() => classMap({ 'smui-chip-input__loading': true, [loading$class()]: true }));
				let $1 = $.derived(() => prefixFilter(restProps, 'loading$'));

				ListText($$anchor, $.spread_props(
					{
						get class() {
							return $.get($0);
						}
					},
					() => $.get($1),
					{
						children: ($$anchor, $$slotProps) => {
							$$props.loading?.($$anchor);
						},
						$$slots: { default: true }
					}
				));
			}
		};

		let $0 = $.derived(() => classMap({
			'smui-chip-input__autocomplete': true,
			[autocomplete$class()]: true
		}));

		let $1 = $.derived(() => prefixFilter(restProps, 'autocomplete$'));

		$.bind_this(
			Autocomplete(node_4, $.spread_props(
				{
					get class() {
						return $.get($0);
					},

					get combobox() {
						return autocomplete$combobox();
					},
					showMenuWithNoInput: false
				},
				() => $.get($1),
				{
					onSMUIAutocompleteSelected: (e) => {
						handleAutocompleteSelected(e);
						$$props.autocomplete$onSMUIAutocompleteSelected?.(e);
					},

					onfocusout: (e) => {
						handleAutocompleteFocusout(e);
						$$props.autocomplete$onfocusout?.(e);
					},

					get value() {
						return value();
					},

					set value($$value) {
						value($$value);
					},

					get text() {
						return text();
					},

					set text($$value) {
						text($$value);
					},
					loading,
					children: ($$anchor, $$slotProps) => {
						{
							const label = ($$anchor) => {
								{
									let $0 = $.derived(() => prefixFilter(restProps, 'label$'));

									$.bind_this(
										FloatingLabel($$anchor, $.spread_props(() => $.get($0), {
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = $.comment();
												var node_5 = $.first_child(fragment_8);

												$.snippet(node_5, () => $$props.label ?? $.noop);
												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										})),
										($$value) => $.set(floatingLabel, $$value, true),
										() => $.get(floatingLabel)
									);
								}
							};

							let $0 = $.derived(() => classMap({
								'smui-chip-input__textfield': true,
								[textfield$class()]: true
							}));

							let $1 = $.derived(() => prefixFilter(restProps, 'textfield$'));

							Textfield($$anchor, $.spread_props(
								{
									get class() {
										return $.get($0);
									},

									get input() {
										return $.get(input);
									},

									get floatingLabel() {
										return $.get(floatingLabel);
									},

									get lineRipple() {
										return $.get(lineRipple);
									}
								},
								() => $.get($1),
								{
									label,
									children: ($$anchor, $$slotProps) => {
										{
											let $0 = $.derived(() => prefixFilter(restProps, 'input$'));

											$.bind_this(
												Input($$anchor, $.spread_props(() => $.get($0), {
													get value() {
														return text();
													},

													set value($$value) {
														text($$value);
													}
												})),
												($$value) => $.set(input, $$value, true),
												() => $.get(input)
											);
										}
									},
									$$slots: { label: true, default: true }
								}
							));
						}
					},
					$$slots: { loading: true, default: true }
				}
			)),
			($$value) => $.set(autocomplete, $$value, true),
			() => $.get(autocomplete)
		);
	}

	var node_6 = $.sibling(node_4, 2);

	{
		let $0 = $.derived(() => prefixFilter(restProps, 'ripple$'));

		$.bind_this(LineRipple(node_6, $.spread_props(() => $.get($0))), ($$value) => $.set(lineRipple, $$value, true), () => $.get(lineRipple));
	}

	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, div);

	return $.pop($$exports);
}