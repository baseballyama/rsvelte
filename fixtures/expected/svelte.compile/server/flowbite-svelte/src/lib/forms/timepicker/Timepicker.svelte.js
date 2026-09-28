import * as $ from 'svelte/internal/server';
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

export default function Timepicker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id = "time",
			endId = "end-time",
			value = "00:00",
			endValue = "00:00",
			min = "",
			max = "",
			required = true,
			disabled = false,
			inputColor,
			buttonColor = "primary",
			Icon,
			iconClass = "h-5 w-5 text-gray-500 dark:text-gray-400",
			type = "default",
			optionLabel = "Options",
			options = [],
			size = "md",
			divClass,
			inputClass,
			selectClass,
			timerangeLabel = "Choose time range",
			timerangeButtonLabel = "Save time",
			timeIntervals = [],
			columns = 2,
			onselect
		} = $$props;

		const theme = $.derived(() => getTheme("timepicker"));

		// Generate theme classes
		const styles = $.derived(() => timepicker({ type, columns, disabled }));

		// State
		let selectedOption = "";

		let showTimerange = false;

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
				target.value = isEndTime ? endValue : value;

				return;
			}

			// Validate against min/max constraints
			if (!isTimeInRange(newValue, min, max)) {
				target.value = isEndTime ? endValue : value;

				return;
			}

			// Use date-fns for reliable time comparison
			const newValueMinutes = timeToMinutes(newValue);

			const valueMinutes = timeToMinutes(value);
			const endValueMinutes = timeToMinutes(endValue);

			if (isEndTime) {
				if (newValueMinutes < valueMinutes) {
					// Only update start time if it respects min/max constraints
					if (isTimeInRange(newValue, min, max)) {
						value = newValue;
					} else {
						target.value = endValue;

						return;
					}
				} else {
					endValue = newValue;
				}
			} else {
				if (newValueMinutes > endValueMinutes) {
					// Only update end time if it respects min/max constraints
					if (isTimeInRange(newValue, min, max)) {
						endValue = newValue;
					} else {
						target.value = value;

						return;
					}
				} else {
					value = newValue;
				}
			}

			if (type !== "timerange-dropdown") {
				notifyChange();
			}
		}

		function handleOptionSelect(event) {
			const target = event.target;

			selectedOption = target.value;
			notifyChange();
		}

		function handleDropdownSelect(option) {
			selectedOption = option.value;
			notifyChange();
		}

		function notifyChange() {
			if (onselect) {
				onselect({
					time: value,
					endTime: endValue,
					[optionLabel ? optionLabel.toLowerCase() : "options"]: selectedOption || options[0]?.value || ""
				});
			}
		}

		function applyTimerange() {
			notifyChange();
		}

		function toggleTimerange() {
			showTimerange = !showTimerange;

			if (!showTimerange) {
				notifyChange();
			}
		}

		function handleInlineButtonSelect(time) {
			if (isValidTimeFormat(time) && isTimeInRange(time, min, max)) {
				value = time;
				notifyChange();
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (type !== "inline-buttons") {
				$$renderer.push('<!--[0-->');

				ButtonGroup($$renderer, {
					size,
					class: styles().buttonGroup({ class: clsx(theme()?.buttonGroup, divClass) }),
					children: ($$renderer) => {
						if (type === "default") {
							$$renderer.push('<!--[0-->');

							Input($$renderer, {
								id,
								color: inputColor,
								type: 'time',
								min,
								max,
								required,
								disabled,
								class: styles().input({
									class: clsx(styles().inputWithIcon(), theme()?.input, inputClass)
								}),
								oninput: (e) => handleTimeChange(e),
								onchange: (e) => handleTimeChange(e),
								get value() {
									return value;
								},

								set value($$value) {
									value = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> <div${$.attr_class($.clsx(styles().iconWrapper({ class: clsx(theme()?.iconWrapper) })))}>`);

							if (Icon) {
								$$renderer.push('<!--[0-->');

								if (Icon) {
									$$renderer.push('<!--[-->');
									Icon($$renderer, { class: iconClass });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							} else {
								$$renderer.push(`<!--[-1--><svg${$.attr_class($.clsx(styles().icon()))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6v4l3.276 3.276M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path></svg>`);
							}

							$$renderer.push(`<!--]--></div>`);
						} else if (type === "select") {
							$$renderer.push('<!--[1-->');

							Input($$renderer, {
								id,
								color: inputColor,
								type: 'time',
								min,
								max,
								required,
								disabled,
								class: styles().input({ class: clsx(theme()?.input, inputClass) }),
								oninput: (e) => handleTimeChange(e),
								onchange: (e) => handleTimeChange(e),
								get value() {
									return value;
								},

								set value($$value) {
									value = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Select($$renderer, {
								selectClass: styles().select({ class: clsx(theme()?.select, selectClass) }),
								onchange: handleOptionSelect,
								items: options,
								value: selectedOption
							});

							$$renderer.push(`<!---->`);
						} else if (type === "dropdown") {
							$$renderer.push('<!--[2-->');

							Input($$renderer, {
								id,
								color: inputColor,
								type: 'time',
								min,
								max,
								required,
								disabled,
								class: styles().input({ class: clsx(theme()?.input, inputClass) }),
								oninput: (e) => handleTimeChange(e),
								onchange: (e) => handleTimeChange(e),
								get value() {
									return value;
								},

								set value($$value) {
									value = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								color: buttonColor,
								class: styles().button({ class: clsx(theme()?.button) }),
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(optionLabel)}<svg${$.attr_class($.clsx(styles().buttonIcon({ class: clsx(theme()?.buttonIcon) })))} aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Dropdown($$renderer, {
								simple: true,
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(options);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let option = each_array[$$index];

										DropdownItem($$renderer, {
											onclick: () => handleDropdownSelect(option),
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(option.name)}`);
											},
											$$slots: { default: true }
										});
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						} else if (type === "range") {
							$$renderer.push(`<!--[3--><div${$.attr_class($.clsx(styles().rangeInputWrapper({ class: clsx(theme()?.rangeInputWrapper) })))}>`);

							Input($$renderer, {
								id,
								color: inputColor,
								type: 'time',
								min,
								max,
								required,
								disabled,
								class: styles().input({
									class: clsx(theme()?.rangeInput, styles().rangeInput(), inputClass)
								}),
								oninput: (e) => handleTimeChange(e),
								onchange: (e) => handleTimeChange(e),
								get value() {
									return value;
								},

								set value($$value) {
									value = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> <button type="button"${$.attr_class($.clsx(styles().rangeButton({ class: clsx(theme()?.rangeButton) })))} aria-label="Open time picker">`);

							if (Icon) {
								$$renderer.push('<!--[0-->');

								if (Icon) {
									$$renderer.push('<!--[-->');
									Icon($$renderer, { class: iconClass });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							} else {
								$$renderer.push(`<!--[-1--><svg${$.attr_class($.clsx(styles().icon({ class: clsx(theme()?.icon) })))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6v4l3.276 3.276M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path></svg>`);
							}

							$$renderer.push(`<!--]--></button></div> <span${$.attr_class($.clsx(styles().rangeSeparator({ class: clsx(theme()?.rangeSeparator) })))}>-</span> <div${$.attr_class($.clsx(styles().rangeInputWrapper({ class: clsx(theme()?.rangeInputWrapper) })))}>`);

							Input($$renderer, {
								id: endId,
								color: inputColor,
								type: 'time',
								min,
								max,
								required,
								disabled,
								class: styles().input({
									class: clsx(styles().rangeInput(), theme()?.rangeInput, inputClass)
								}),
								oninput: (e) => handleTimeChange(e, true),
								onchange: (e) => handleTimeChange(e, true),
								get value() {
									return endValue;
								},

								set value($$value) {
									endValue = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> <button type="button"${$.attr_class($.clsx(styles().rangeButton({ class: clsx(theme()?.rangeButton) })))} aria-label="Open end time picker">`);

							if (Icon) {
								$$renderer.push('<!--[0-->');

								if (Icon) {
									$$renderer.push('<!--[-->');
									Icon($$renderer, { class: iconClass });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							} else {
								$$renderer.push(`<!--[-1--><svg${$.attr_class($.clsx(styles().icon({ class: clsx(theme()?.icon) })))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6v4l3.276 3.276M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path></svg>`);
							}

							$$renderer.push(`<!--]--></button></div>`);
						} else if (type === "timerange-dropdown") {
							$$renderer.push('<!--[4-->');

							Button($$renderer, {
								color: buttonColor,
								size,
								class: styles().button({ class: clsx(theme()?.button) }),
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(timerangeLabel)}<svg${$.attr_class($.clsx(styles().buttonIcon({ class: clsx(theme()?.buttonIcon) })))} aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Dropdown($$renderer, {
								simple: true,
								class: styles().dropdownContent({ class: clsx(theme()?.dropdownContent) }),
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(styles().dropdownInner({ class: clsx(theme()?.dropdownInner) })))}><div${$.attr_class($.clsx(styles().dropdownTimeRow({ class: clsx(theme()?.dropdownTimeRow) })))}><div${$.attr_class($.clsx(styles().dropdownTimeCol({ class: clsx(theme()?.dropdownTimeCol) })))}>`);

									Label($$renderer, {
										for: id,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Start time:`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id,
										color: inputColor,
										type: 'time',
										min,
										max,
										required,
										disabled,
										class: styles().dropdownTimeInput({ class: clsx(theme()?.dropdownTimeInput, inputClass) }),
										oninput: (e) => handleTimeChange(e),
										onchange: (e) => handleTimeChange(e),
										get value() {
											return value;
										},

										set value($$value) {
											value = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div> <div${$.attr_class($.clsx(styles().dropdownTimeCol({ class: clsx(theme()?.dropdownTimeCol) })))}>`);

									Label($$renderer, {
										for: endId,
										children: ($$renderer) => {
											$$renderer.push(`<!---->End time:`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: endId,
										color: inputColor,
										type: 'time',
										min,
										max,
										required,
										disabled,
										class: styles().dropdownTimeInput({ class: clsx(theme()?.dropdownTimeInput, inputClass) }),
										oninput: (e) => handleTimeChange(e, true),
										onchange: (e) => handleTimeChange(e, true),
										get value() {
											return endValue;
										},

										set value($$value) {
											endValue = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div></div> `);

									Button($$renderer, {
										color: buttonColor,
										class: styles().dropdownButton({ class: clsx(theme()?.dropdownButton) }),
										onclick: applyTimerange,
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(timerangeButtonLabel)}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						} else if (type === "timerange-toggle") {
							$$renderer.push(`<!--[5--><div${$.attr_class($.clsx(styles().toggleWrapper({ class: clsx(theme()?.toggleWrapper) })))}><div${$.attr_class($.clsx(styles().toggleRow({ class: clsx(theme()?.toggleRow) })))}>`);

							Toggle($$renderer, {
								id: `${id}-timerange-toggle`,
								checked: showTimerange,
								onchange: toggleTimerange,
								spanClass: 'me-0 rounded-lg'
							});

							$$renderer.push(`<!----></div> `);

							if (showTimerange) {
								$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(styles().toggleTimeRow({ class: clsx(theme()?.toggleTimeRow) })))}><div${$.attr_class($.clsx(styles().toggleTimeCol({ class: clsx(theme()?.toggleTimeCol) })))}>`);

								Label($$renderer, {
									for: id,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Start time:`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Input($$renderer, {
									id,
									color: inputColor,
									type: 'time',
									min,
									max,
									required,
									disabled,
									class: styles().toggleTimeInput({ class: clsx(theme()?.toggleTimeInput, inputClass) }),
									oninput: (e) => handleTimeChange(e),
									onchange: (e) => handleTimeChange(e),
									get value() {
										return value;
									},

									set value($$value) {
										value = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----></div> <div${$.attr_class($.clsx(styles().toggleTimeCol({ class: clsx(theme()?.toggleTimeCol) })))}>`);

								Label($$renderer, {
									for: endId,
									children: ($$renderer) => {
										$$renderer.push(`<!---->End time:`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Input($$renderer, {
									id: endId,
									color: inputColor,
									type: 'time',
									min,
									max,
									required,
									disabled,
									class: styles().toggleTimeInput({ class: clsx(theme()?.toggleTimeInput, inputClass) }),
									oninput: (e) => handleTimeChange(e, true),
									onchange: (e) => handleTimeChange(e, true),
									get value() {
										return endValue;
									},

									set value($$value) {
										endValue = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----></div></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push(`<!--[-1--><div${$.attr_class($.clsx(styles().inlineGrid({ class: clsx(theme()?.inlineGrid) })))}><!--[-->`);

				const each_array_1 = $.ensure_array_like(timeIntervals);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let time = each_array_1[$$index_1];

					Button($$renderer, {
						size,
						color: value === time ? buttonColor : "light",
						class: styles().inlineButton({ class: clsx(theme()?.inlineButton) }),
						onclick: () => handleInlineButtonSelect(time),
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(time)}`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { value, endValue });
	});
}