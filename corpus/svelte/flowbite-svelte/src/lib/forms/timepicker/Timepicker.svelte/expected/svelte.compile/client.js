import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import Input from "$lib/forms/input-field/Input.svelte";
import Select from "$lib/forms/select/Select.svelte";
import Button from "$lib/buttons/Button.svelte";
import ButtonGroup from "$lib/button-group/ButtonGroup.svelte";
import Dropdown from "$lib/dropdown/Dropdown.svelte";
import DropdownItem from "$lib/dropdown/DropdownItem.svelte";
import Label from "$lib/forms/label/Label.svelte";
import Toggle from "$lib/forms/toggle/Toggle.svelte";
import { timepicker } from "./theme";
import { parse, isValid, isBefore, isAfter } from "date-fns";
import { getTheme } from "$lib/theme/themeUtils";

var root = $.from_svg(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6v4l3.276 3.276M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path></svg>`);
var root_1 = $.from_html(`<!> <div><!></div>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_svg(` <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<div><!> <button type="button" aria-label="Open time picker"><!></button></div> <span>-</span> <div><!> <button type="button" aria-label="Open end time picker"><!></button></div>`, 1);
var root_6 = $.from_html(`<div><div><div><!> <!></div> <div><!> <!></div></div> <!></div>`);
var root_7 = $.from_html(`<div><div><!> <!></div> <div><!> <!></div></div>`);
var root_8 = $.from_html(`<div><div><!></div> <!></div>`);
var root_9 = $.from_html(`<div></div>`);

export default function Timepicker($$anchor, $$props) {
	$.push($$props, true);

	let id = $.prop($$props, 'id', 3, "time"),
		endId = $.prop($$props, 'endId', 3, "end-time"),
		value = $.prop($$props, 'value', 15, "00:00"),
		endValue = $.prop($$props, 'endValue', 15, "00:00"),
		min = $.prop($$props, 'min', 3, ""),
		max = $.prop($$props, 'max', 3, ""),
		required = $.prop($$props, 'required', 3, true),
		disabled = $.prop($$props, 'disabled', 3, false),
		buttonColor = $.prop($$props, 'buttonColor', 3, "primary"),
		iconClass = $.prop($$props, 'iconClass', 3, "h-5 w-5 text-gray-500 dark:text-gray-400"),
		type = $.prop($$props, 'type', 3, "default"),
		optionLabel = $.prop($$props, 'optionLabel', 3, "Options"),
		options = $.prop($$props, 'options', 19, () => []),
		size = $.prop($$props, 'size', 3, "md"),
		timerangeLabel = $.prop($$props, 'timerangeLabel', 3, "Choose time range"),
		timerangeButtonLabel = $.prop($$props, 'timerangeButtonLabel', 3, "Save time"),
		timeIntervals = $.prop($$props, 'timeIntervals', 19, () => []),
		columns = $.prop($$props, 'columns', 3, 2);

	const theme = $.derived(() => getTheme("timepicker"));

	// Generate theme classes
	const styles = $.derived(() => timepicker({ type: type(), columns: columns(), disabled: disabled() }));

	// State
	let selectedOption = $.state("");

	let showTimerange = $.state(false);

	// Helper functions using date-fns
	function parseTime(time) {
		if (!time) return null;

		const parsed = parse(time, "HH:mm", new Date());

		return isValid(parsed) ? parsed : null;
	}

	function timeToMinutes(time) {
		const date = parseTime(time);

		return date ? date.getHours() * 60 + date.getMinutes() : 0;
	}

	function isValidTimeFormat(time) {
		return parseTime(time) !== null;
	}

	function isTimeInRange(time, minTime, maxTime) {
		const timeDate = parseTime(time);

		if (!timeDate) return false;

		if (minTime) {
			const minDate = parseTime(minTime);

			if (minDate && isBefore(timeDate, minDate)) return false;
		}

		if (maxTime) {
			const maxDate = parseTime(maxTime);

			if (maxDate && isAfter(timeDate, maxDate)) return false;
		}

		return true;
	}

	function handleTimeChange(event, isEndTime = false) {
		const target = event.target;
		const newValue = target.value;

		// Validate time format
		if (!isValidTimeFormat(newValue)) {
			target.value = isEndTime ? endValue() : value();

			return;
		}

		// Validate against min/max constraints
		if (!isTimeInRange(newValue, min(), max())) {
			target.value = isEndTime ? endValue() : value();

			return;
		}

		// Use date-fns for reliable time comparison
		const newValueMinutes = timeToMinutes(newValue);

		const valueMinutes = timeToMinutes(value());
		const endValueMinutes = timeToMinutes(endValue());

		if (isEndTime) {
			if (newValueMinutes < valueMinutes) {
				// Only update start time if it respects min/max constraints
				if (isTimeInRange(newValue, min(), max())) {
					value(newValue);
				} else {
					target.value = endValue();

					return;
				}
			} else {
				endValue(newValue);
			}
		} else {
			if (newValueMinutes > endValueMinutes) {
				// Only update end time if it respects min/max constraints
				if (isTimeInRange(newValue, min(), max())) {
					endValue(newValue);
				} else {
					target.value = value();

					return;
				}
			} else {
				value(newValue);
			}
		}

		if (type() !== "timerange-dropdown") {
			notifyChange();
		}
	}

	function handleOptionSelect(event) {
		const target = event.target;

		$.set(selectedOption, target.value, true);
		notifyChange();
	}

	function handleDropdownSelect(option) {
		$.set(selectedOption, option.value, true);
		notifyChange();
	}

	function notifyChange() {
		if ($$props.onselect) {
			$$props.onselect({
				time: value(),
				endTime: endValue(),
				[optionLabel() ? optionLabel().toLowerCase() : "options"]: $.get(selectedOption) || options()[0]?.value || ""
			});
		}
	}

	function applyTimerange() {
		notifyChange();
	}

	function toggleTimerange() {
		$.set(showTimerange, !$.get(showTimerange));

		if (!$.get(showTimerange)) {
			notifyChange();
		}
	}

	function handleInlineButtonSelect(time) {
		if (isValidTimeFormat(time) && isTimeInRange(time, min(), max())) {
			value(time);
			notifyChange();
		}
	}

	// Ensure initial values are valid
	$.user_effect(() => {
		if (!isValidTimeFormat(value())) {
			value("00:00");
		}

		if (!isValidTimeFormat(endValue())) {
			endValue("00:00");
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_10 = ($$anchor) => {
			{
				let $0 = $.derived(() => $.get(styles).buttonGroup({ class: clsx($.get(theme)?.buttonGroup, $$props.divClass) }));

				ButtonGroup($$anchor, {
					get size() {
						return size();
					},

					get class() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						{
							var consequent_1 = ($$anchor) => {
								var fragment_3 = root_1();
								var node_2 = $.first_child(fragment_3);

								{
									let $0 = $.derived(() => $.get(styles).input({
										class: clsx($.get(styles).inputWithIcon(), $.get(theme)?.input, $$props.inputClass)
									}));

									Input(node_2, {
										get id() {
											return id();
										},

										get color() {
											return $$props.inputColor;
										},
										type: 'time',
										get min() {
											return min();
										},

										get max() {
											return max();
										},

										get required() {
											return required();
										},

										get disabled() {
											return disabled();
										},

										get class() {
											return $.get($0);
										},
										oninput: (e) => handleTimeChange(e),
										onchange: (e) => handleTimeChange(e),
										get value() {
											return value();
										},

										set value($$value) {
											value($$value);
										}
									});
								}

								var div = $.sibling(node_2, 2);
								var node_3 = $.child(div);

								{
									var consequent = ($$anchor) => {
										var fragment_4 = $.comment();
										var node_4 = $.first_child(fragment_4);

										$.component(node_4, () => $$props.Icon, ($$anchor, Icon_1) => {
											Icon_1($$anchor, {
												get class() {
													return iconClass();
												}
											});
										});

										$.append($$anchor, fragment_4);
									};

									var alternate = ($$anchor) => {
										var svg = root();

										$.template_effect(($0) => $.set_class(svg, 0, $0), [() => $.clsx($.get(styles).icon())]);
										$.append($$anchor, svg);
									};

									$.if(node_3, ($$render) => {
										if ($$props.Icon) $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.reset(div);

								$.template_effect(($0) => $.set_class(div, 1, $0), [
									() => $.clsx($.get(styles).iconWrapper({ class: clsx($.get(theme)?.iconWrapper) }))
								]);

								$.append($$anchor, fragment_3);
							};

							var consequent_2 = ($$anchor) => {
								var fragment_5 = root_2();
								var node_5 = $.first_child(fragment_5);

								{
									let $0 = $.derived(() => $.get(styles).input({ class: clsx($.get(theme)?.input, $$props.inputClass) }));

									Input(node_5, {
										get id() {
											return id();
										},

										get color() {
											return $$props.inputColor;
										},
										type: 'time',
										get min() {
											return min();
										},

										get max() {
											return max();
										},

										get required() {
											return required();
										},

										get disabled() {
											return disabled();
										},

										get class() {
											return $.get($0);
										},
										oninput: (e) => handleTimeChange(e),
										onchange: (e) => handleTimeChange(e),
										get value() {
											return value();
										},

										set value($$value) {
											value($$value);
										}
									});
								}

								var node_6 = $.sibling(node_5, 2);

								{
									let $0 = $.derived(() => $.get(styles).select({ class: clsx($.get(theme)?.select, $$props.selectClass) }));

									Select(node_6, {
										get selectClass() {
											return $.get($0);
										},
										onchange: handleOptionSelect,
										get items() {
											return options();
										},

										get value() {
											return $.get(selectedOption);
										}
									});
								}

								$.append($$anchor, fragment_5);
							};

							var consequent_3 = ($$anchor) => {
								var fragment_6 = root_4();
								var node_7 = $.first_child(fragment_6);

								{
									let $0 = $.derived(() => $.get(styles).input({ class: clsx($.get(theme)?.input, $$props.inputClass) }));

									Input(node_7, {
										get id() {
											return id();
										},

										get color() {
											return $$props.inputColor;
										},
										type: 'time',
										get min() {
											return min();
										},

										get max() {
											return max();
										},

										get required() {
											return required();
										},

										get disabled() {
											return disabled();
										},

										get class() {
											return $.get($0);
										},
										oninput: (e) => handleTimeChange(e),
										onchange: (e) => handleTimeChange(e),
										get value() {
											return value();
										},

										set value($$value) {
											value($$value);
										}
									});
								}

								var node_8 = $.sibling(node_7, 2);

								{
									let $0 = $.derived(() => $.get(styles).button({ class: clsx($.get(theme)?.button) }));

									Button(node_8, {
										get color() {
											return buttonColor();
										},

										get class() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_7 = root_3();
											var text = $.first_child(fragment_7, true);
											var svg_1 = $.sibling(text);

											$.template_effect(
												($0) => {
													$.set_text(text, optionLabel());
													$.set_class(svg_1, 0, $0);
												},
												[
													() => $.clsx($.get(styles).buttonIcon({ class: clsx($.get(theme)?.buttonIcon) }))
												]
											);

											$.append($$anchor, fragment_7);
										},
										$$slots: { default: true }
									});
								}

								var node_9 = $.sibling(node_8, 2);

								Dropdown(node_9, {
									simple: true,
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = $.comment();
										var node_10 = $.first_child(fragment_8);

										$.each(node_10, 17, options, (option) => option.value, ($$anchor, option) => {
											DropdownItem($$anchor, {
												onclick: () => handleDropdownSelect($.get(option)),
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text();

													$.template_effect(() => $.set_text(text_1, $.get(option).name));
													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_6);
							};

							var consequent_6 = ($$anchor) => {
								var fragment_11 = root_5();
								var div_1 = $.first_child(fragment_11);
								var node_11 = $.child(div_1);

								{
									let $0 = $.derived(() => $.get(styles).input({
										class: clsx($.get(theme)?.rangeInput, $.get(styles).rangeInput(), $$props.inputClass)
									}));

									Input(node_11, {
										get id() {
											return id();
										},

										get color() {
											return $$props.inputColor;
										},
										type: 'time',
										get min() {
											return min();
										},

										get max() {
											return max();
										},

										get required() {
											return required();
										},

										get disabled() {
											return disabled();
										},

										get class() {
											return $.get($0);
										},
										oninput: (e) => handleTimeChange(e),
										onchange: (e) => handleTimeChange(e),
										get value() {
											return value();
										},

										set value($$value) {
											value($$value);
										}
									});
								}

								var button = $.sibling(node_11, 2);
								var node_12 = $.child(button);

								{
									var consequent_4 = ($$anchor) => {
										var fragment_12 = $.comment();
										var node_13 = $.first_child(fragment_12);

										$.component(node_13, () => $$props.Icon, ($$anchor, Icon_2) => {
											Icon_2($$anchor, {
												get class() {
													return iconClass();
												}
											});
										});

										$.append($$anchor, fragment_12);
									};

									var alternate_1 = ($$anchor) => {
										var svg_2 = root();

										$.template_effect(($0) => $.set_class(svg_2, 0, $0), [
											() => $.clsx($.get(styles).icon({ class: clsx($.get(theme)?.icon) }))
										]);

										$.append($$anchor, svg_2);
									};

									$.if(node_12, ($$render) => {
										if ($$props.Icon) $$render(consequent_4); else $$render(alternate_1, -1);
									});
								}

								$.reset(button);
								$.reset(div_1);

								var span = $.sibling(div_1, 2);
								var div_2 = $.sibling(span, 2);
								var node_14 = $.child(div_2);

								{
									let $0 = $.derived(() => $.get(styles).input({
										class: clsx($.get(styles).rangeInput(), $.get(theme)?.rangeInput, $$props.inputClass)
									}));

									Input(node_14, {
										get id() {
											return endId();
										},

										get color() {
											return $$props.inputColor;
										},
										type: 'time',
										get min() {
											return min();
										},

										get max() {
											return max();
										},

										get required() {
											return required();
										},

										get disabled() {
											return disabled();
										},

										get class() {
											return $.get($0);
										},
										oninput: (e) => handleTimeChange(e, true),
										onchange: (e) => handleTimeChange(e, true),
										get value() {
											return endValue();
										},

										set value($$value) {
											endValue($$value);
										}
									});
								}

								var button_1 = $.sibling(node_14, 2);
								var node_15 = $.child(button_1);

								{
									var consequent_5 = ($$anchor) => {
										var fragment_13 = $.comment();
										var node_16 = $.first_child(fragment_13);

										$.component(node_16, () => $$props.Icon, ($$anchor, Icon_3) => {
											Icon_3($$anchor, {
												get class() {
													return iconClass();
												}
											});
										});

										$.append($$anchor, fragment_13);
									};

									var alternate_2 = ($$anchor) => {
										var svg_3 = root();

										$.template_effect(($0) => $.set_class(svg_3, 0, $0), [
											() => $.clsx($.get(styles).icon({ class: clsx($.get(theme)?.icon) }))
										]);

										$.append($$anchor, svg_3);
									};

									$.if(node_15, ($$render) => {
										if ($$props.Icon) $$render(consequent_5); else $$render(alternate_2, -1);
									});
								}

								$.reset(button_1);
								$.reset(div_2);

								$.template_effect(
									($0, $1, $2, $3, $4) => {
										$.set_class(div_1, 1, $0);
										$.set_class(button, 1, $1);
										$.set_class(span, 1, $2);
										$.set_class(div_2, 1, $3);
										$.set_class(button_1, 1, $4);
									},
									[
										() => $.clsx($.get(styles).rangeInputWrapper({ class: clsx($.get(theme)?.rangeInputWrapper) })),
										() => $.clsx($.get(styles).rangeButton({ class: clsx($.get(theme)?.rangeButton) })),
										() => $.clsx($.get(styles).rangeSeparator({ class: clsx($.get(theme)?.rangeSeparator) })),
										() => $.clsx($.get(styles).rangeInputWrapper({ class: clsx($.get(theme)?.rangeInputWrapper) })),
										() => $.clsx($.get(styles).rangeButton({ class: clsx($.get(theme)?.rangeButton) }))
									]
								);

								$.delegated('click', button, () => document.getElementById(id())?.click());
								$.delegated('click', button_1, () => document.getElementById(endId())?.click());
								$.append($$anchor, fragment_11);
							};

							var consequent_7 = ($$anchor) => {
								var fragment_14 = root_2();
								var node_17 = $.first_child(fragment_14);

								{
									let $0 = $.derived(() => $.get(styles).button({ class: clsx($.get(theme)?.button) }));

									Button(node_17, {
										get color() {
											return buttonColor();
										},

										get size() {
											return size();
										},

										get class() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_15 = root_3();
											var text_2 = $.first_child(fragment_15, true);
											var svg_4 = $.sibling(text_2);

											$.template_effect(
												($0) => {
													$.set_text(text_2, timerangeLabel());
													$.set_class(svg_4, 0, $0);
												},
												[
													() => $.clsx($.get(styles).buttonIcon({ class: clsx($.get(theme)?.buttonIcon) }))
												]
											);

											$.append($$anchor, fragment_15);
										},
										$$slots: { default: true }
									});
								}

								var node_18 = $.sibling(node_17, 2);

								{
									let $0 = $.derived(() => $.get(styles).dropdownContent({ class: clsx($.get(theme)?.dropdownContent) }));

									Dropdown(node_18, {
										simple: true,
										get class() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											var div_3 = root_6();
											var div_4 = $.child(div_3);
											var div_5 = $.child(div_4);
											var node_19 = $.child(div_5);

											Label(node_19, {
												get for() {
													return id();
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Start time:');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});

											var node_20 = $.sibling(node_19, 2);

											{
												let $0 = $.derived(() => $.get(styles).dropdownTimeInput({
													class: clsx($.get(theme)?.dropdownTimeInput, $$props.inputClass)
												}));

												Input(node_20, {
													get id() {
														return id();
													},

													get color() {
														return $$props.inputColor;
													},
													type: 'time',
													get min() {
														return min();
													},

													get max() {
														return max();
													},

													get required() {
														return required();
													},

													get disabled() {
														return disabled();
													},

													get class() {
														return $.get($0);
													},
													oninput: (e) => handleTimeChange(e),
													onchange: (e) => handleTimeChange(e),
													get value() {
														return value();
													},

													set value($$value) {
														value($$value);
													}
												});
											}

											$.reset(div_5);

											var div_6 = $.sibling(div_5, 2);
											var node_21 = $.child(div_6);

											Label(node_21, {
												get for() {
													return endId();
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('End time:');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});

											var node_22 = $.sibling(node_21, 2);

											{
												let $0 = $.derived(() => $.get(styles).dropdownTimeInput({
													class: clsx($.get(theme)?.dropdownTimeInput, $$props.inputClass)
												}));

												Input(node_22, {
													get id() {
														return endId();
													},

													get color() {
														return $$props.inputColor;
													},
													type: 'time',
													get min() {
														return min();
													},

													get max() {
														return max();
													},

													get required() {
														return required();
													},

													get disabled() {
														return disabled();
													},

													get class() {
														return $.get($0);
													},
													oninput: (e) => handleTimeChange(e, true),
													onchange: (e) => handleTimeChange(e, true),
													get value() {
														return endValue();
													},

													set value($$value) {
														endValue($$value);
													}
												});
											}

											$.reset(div_6);
											$.reset(div_4);

											var node_23 = $.sibling(div_4, 2);

											{
												let $0 = $.derived(() => $.get(styles).dropdownButton({ class: clsx($.get(theme)?.dropdownButton) }));

												Button(node_23, {
													get color() {
														return buttonColor();
													},

													get class() {
														return $.get($0);
													},
													onclick: applyTimerange,
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_5 = $.text();

														$.template_effect(() => $.set_text(text_5, timerangeButtonLabel()));
														$.append($$anchor, text_5);
													},
													$$slots: { default: true }
												});
											}

											$.reset(div_3);

											$.template_effect(
												($0, $1, $2, $3) => {
													$.set_class(div_3, 1, $0);
													$.set_class(div_4, 1, $1);
													$.set_class(div_5, 1, $2);
													$.set_class(div_6, 1, $3);
												},
												[
													() => $.clsx($.get(styles).dropdownInner({ class: clsx($.get(theme)?.dropdownInner) })),
													() => $.clsx($.get(styles).dropdownTimeRow({ class: clsx($.get(theme)?.dropdownTimeRow) })),
													() => $.clsx($.get(styles).dropdownTimeCol({ class: clsx($.get(theme)?.dropdownTimeCol) })),
													() => $.clsx($.get(styles).dropdownTimeCol({ class: clsx($.get(theme)?.dropdownTimeCol) }))
												]
											);

											$.append($$anchor, div_3);
										},
										$$slots: { default: true }
									});
								}

								$.append($$anchor, fragment_14);
							};

							var consequent_9 = ($$anchor) => {
								var div_7 = root_8();
								var div_8 = $.child(div_7);
								var node_24 = $.child(div_8);

								{
									let $0 = $.derived(() => `${id()}-timerange-toggle`);

									Toggle(node_24, {
										get id() {
											return $.get($0);
										},

										get checked() {
											return $.get(showTimerange);
										},
										onchange: toggleTimerange,
										spanClass: 'me-0 rounded-lg'
									});
								}

								$.reset(div_8);

								var node_25 = $.sibling(div_8, 2);

								{
									var consequent_8 = ($$anchor) => {
										var div_9 = root_7();
										var div_10 = $.child(div_9);
										var node_26 = $.child(div_10);

										Label(node_26, {
											get for() {
												return id();
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('Start time:');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});

										var node_27 = $.sibling(node_26, 2);

										{
											let $0 = $.derived(() => $.get(styles).toggleTimeInput({
												class: clsx($.get(theme)?.toggleTimeInput, $$props.inputClass)
											}));

											Input(node_27, {
												get id() {
													return id();
												},

												get color() {
													return $$props.inputColor;
												},
												type: 'time',
												get min() {
													return min();
												},

												get max() {
													return max();
												},

												get required() {
													return required();
												},

												get disabled() {
													return disabled();
												},

												get class() {
													return $.get($0);
												},
												oninput: (e) => handleTimeChange(e),
												onchange: (e) => handleTimeChange(e),
												get value() {
													return value();
												},

												set value($$value) {
													value($$value);
												}
											});
										}

										$.reset(div_10);

										var div_11 = $.sibling(div_10, 2);
										var node_28 = $.child(div_11);

										Label(node_28, {
											get for() {
												return endId();
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('End time:');

												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});

										var node_29 = $.sibling(node_28, 2);

										{
											let $0 = $.derived(() => $.get(styles).toggleTimeInput({
												class: clsx($.get(theme)?.toggleTimeInput, $$props.inputClass)
											}));

											Input(node_29, {
												get id() {
													return endId();
												},

												get color() {
													return $$props.inputColor;
												},
												type: 'time',
												get min() {
													return min();
												},

												get max() {
													return max();
												},

												get required() {
													return required();
												},

												get disabled() {
													return disabled();
												},

												get class() {
													return $.get($0);
												},
												oninput: (e) => handleTimeChange(e, true),
												onchange: (e) => handleTimeChange(e, true),
												get value() {
													return endValue();
												},

												set value($$value) {
													endValue($$value);
												}
											});
										}

										$.reset(div_11);
										$.reset(div_9);

										$.template_effect(
											($0, $1, $2) => {
												$.set_class(div_9, 1, $0);
												$.set_class(div_10, 1, $1);
												$.set_class(div_11, 1, $2);
											},
											[
												() => $.clsx($.get(styles).toggleTimeRow({ class: clsx($.get(theme)?.toggleTimeRow) })),
												() => $.clsx($.get(styles).toggleTimeCol({ class: clsx($.get(theme)?.toggleTimeCol) })),
												() => $.clsx($.get(styles).toggleTimeCol({ class: clsx($.get(theme)?.toggleTimeCol) }))
											]
										);

										$.append($$anchor, div_9);
									};

									$.if(node_25, ($$render) => {
										if ($.get(showTimerange)) $$render(consequent_8);
									});
								}

								$.reset(div_7);

								$.template_effect(
									($0, $1) => {
										$.set_class(div_7, 1, $0);
										$.set_class(div_8, 1, $1);
									},
									[
										() => $.clsx($.get(styles).toggleWrapper({ class: clsx($.get(theme)?.toggleWrapper) })),
										() => $.clsx($.get(styles).toggleRow({ class: clsx($.get(theme)?.toggleRow) }))
									]
								);

								$.append($$anchor, div_7);
							};

							$.if(node_1, ($$render) => {
								if (type() === "default") $$render(consequent_1); else if (type() === "select") $$render(consequent_2, 1); else if (type() === "dropdown") $$render(consequent_3, 2); else if (type() === "range") $$render(consequent_6, 3); else if (type() === "timerange-dropdown") $$render(consequent_7, 4); else if (type() === "timerange-toggle") $$render(consequent_9, 5);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			}
		};

		var alternate_3 = ($$anchor) => {
			var div_12 = root_9();

			$.each(div_12, 20, timeIntervals, (time) => time, ($$anchor, time) => {
				{
					let $0 = $.derived(() => value() === time ? buttonColor() : "light");
					let $1 = $.derived(() => $.get(styles).inlineButton({ class: clsx($.get(theme)?.inlineButton) }));

					Button($$anchor, {
						get size() {
							return size();
						},

						get color() {
							return $.get($0);
						},

						get class() {
							return $.get($1);
						},
						onclick: () => handleInlineButtonSelect(time),
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text();

							$.template_effect(() => $.set_text(text_8, time));
							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});
				}
			});

			$.reset(div_12);

			$.template_effect(($0) => $.set_class(div_12, 1, $0), [
				() => $.clsx($.get(styles).inlineGrid({ class: clsx($.get(theme)?.inlineGrid) }))
			]);

			$.append($$anchor, div_12);
		};

		$.if(node, ($$render) => {
			if (type() !== "inline-buttons") $$render(consequent_10); else $$render(alternate_3, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);