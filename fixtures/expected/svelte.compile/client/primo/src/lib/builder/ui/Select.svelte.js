import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';
import * as _ from 'lodash-es';
import { fade } from 'svelte/transition';
import Icon from '@iconify/svelte';
import { clickOutside, createUniqueID } from '../utilities.js';
import { createPopperActions } from 'svelte-popperjs';
import { offsetByFixedParents } from '../utils/popper-fix';

var root = $.from_html(`<label class="primo--field-label"><!> <span> </span></label>`);
var root_1 = $.from_html(`<div style="padding: 3.5px;"><!></div>`);
var root_2 = $.from_html(`<div class="icon svelte-fn7uzq"><!></div>`);
var root_3 = $.from_html(`<!> <p class="svelte-fn7uzq"> </p>`, 1);
var root_4 = $.from_html(`<p class="svelte-fn7uzq"> </p>`);
var root_5 = $.from_html(`<button class="svelte-fn7uzq"><!></button>`);
var root_6 = $.from_html(`<hr class="svelte-fn7uzq"/>`);
var root_7 = $.from_html(`<div class="item svelte-fn7uzq"><button type="button"><!> <span> </span></button> <!></div> <!>`, 1);
var root_8 = $.from_html(`<div class="options svelte-fn7uzq"></div>`);
var root_9 = $.from_html(`<div class="item svelte-fn7uzq"><button type="button" class="svelte-fn7uzq"> </button></div>`);
var root_10 = $.from_html(`<div class="submenu svelte-fn7uzq"><header class="svelte-fn7uzq"><span class="svelte-fn7uzq"> </span> <button type="button" class="svelte-fn7uzq"><!></button></header> <div class="options svelte-fn7uzq"><!></div></div>`);
var root_11 = $.from_html(`<div class="popup svelte-fn7uzq"><!></div>`);
var root_12 = $.from_html(`<div role="menu"><div class="select-container svelte-fn7uzq"><!> <button type="button"><!> <span class="dropdown-icon svelte-fn7uzq"><!></span></button></div> <!></div>`);

export default function Select($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();

	/**
	 * @typedef {Object} Props
	 * @property {string} [icon]
	 * @property {string} [label]
	 * @property {any} [options]
	 * @property {any} [value]
	 * @property {any} [fallback_label]
	 * @property {any} [dividers]
	 * @property {string} [placement]
	 * @property {string} [variant]
	 * @property {boolean} [fullwidth]
	 * @property {boolean} [loading]
	 * @property {boolean} [disable_auto_highlight]
	 */
	/** @type {Props} */
	let icon = $.prop($$props, 'icon', 3, ''),
		label = $.prop($$props, 'label', 3, ''),
		options = $.prop($$props, 'options', 19, () => []),
		value = $.prop($$props, 'value', 19, () => options()[0]?.['value']),
		fallback_label = $.prop($$props, 'fallback_label', 3, null),
		dividers = $.prop($$props, 'dividers', 19, () => []),
		placement = $.prop($$props, 'placement', 3, 'bottom-start'),
		variant = $.prop($$props, 'variant', 3, 'small'),
		fullwidth = $.prop($$props, 'fullwidth', 3, false),
		loading = $.prop($$props, 'loading', 3, false),
		disable_auto_highlight = $.prop($$props, 'disable_auto_highlight', 3, false);

	const [popperRef, popperContent] = createPopperActions({
		placement: placement(),
		strategy: 'fixed',
		modifiers: fullwidth()
			? [
				offsetByFixedParents,
				{ name: 'offset', options: { offset: [0, 3] } },
				{
					name: 'sameWidth',
					enabled: true,
					fn: ({ state }) => {
						state.styles.popper.width = `${state.rects.reference.width}px`;
					},
					phase: 'beforeWrite',
					requires: ['computeStyles']
				}
			]
			: [
				offsetByFixedParents,
				{ name: 'offset', options: { offset: [0, 3] } }
			]
	});

	let showing_dropdown = $.state(false);
	let active_submenu = $.state(null);
	let selected_submenu_option = null;
	const select_id = createUniqueID();

	function find_with_object(options, value) {
		let selected;

		for (const option of options) {
			const selected_suboption = option.suboptions?.find((sub) => sub.value === value);

			if (selected_suboption) {
				selected = selected_suboption;
			} else if (option.value === value) {
				selected = option;
			}
		}

		return selected;
	}

	options().find((option) => {
		const selected_suboption = option.suboptions?.find((sub) => sub.value === value());

		return option.value === value() || selected_suboption;
	});

	// highlight button when passed value changes (i.e. when auto-changing field type based on name)
	let highlighted = $.state(false);

	let disable_highlight = true; // prevent highlighting on initial value set
	let manually_selected = $.state(false // or manual set
	);
	let last_value = $.state($.proxy(value()));

	function highlight_button(val) {
		if (disable_auto_highlight()) {
			return;
		}

		if (disable_highlight) {
			disable_highlight = false;

			return;
		} else if (!$.get(manually_selected) && val !== $.get(last_value)) {
			$.set(highlighted, true);
			$.set(last_value, val, true);

			setTimeout(
				() => {
					$.set(highlighted, false);
				},
				400
			);
		}
	}

	let selected = $.derived(() => find_with_object(options(), value()));

	$.user_effect(() => {
		highlight_button(value());
	});

	var div = root_12();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent_1 = ($$anchor) => {
			var label_1 = root();
			var node_1 = $.child(label_1);

			{
				var consequent = ($$anchor) => {
					Icon($$anchor, {
						get icon() {
							return icon();
						}
					});
				};

				$.if(node_1, ($$render) => {
					if (icon()) $$render(consequent);
				});
			}

			var span = $.sibling(node_1, 2);
			var text = $.only_child(span, true);

			$.reset(label_1);

			$.template_effect(() => {
				$.set_attribute(label_1, 'for', select_id);
				$.set_text(text, label());
			});

			$.append($$anchor, label_1);
		};

		$.if(node, ($$render) => {
			if (label()) $$render(consequent_1);
		});
	}

	var button = $.sibling(node, 2);
	let classes;
	var node_2 = $.child(button);

	{
		var consequent_2 = ($$anchor) => {
			var div_2 = root_1();
			var node_3 = $.child(div_2);

			Icon(node_3, { icon: 'line-md:loading-twotone-loop' });
			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		var consequent_4 = ($$anchor) => {
			var fragment_1 = root_3();
			var node_4 = $.first_child(fragment_1);

			{
				var consequent_3 = ($$anchor) => {
					var div_3 = root_2();
					var node_5 = $.child(div_3);

					Icon(node_5, {
						get icon() {
							return $.get(selected).icon;
						}
					});

					$.reset(div_3);
					$.append($$anchor, div_3);
				};

				$.if(node_4, ($$render) => {
					if ($.get(selected).icon) $$render(consequent_3);
				});
			}

			var p = $.sibling(node_4, 2);
			var text_1 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_1, $.get(selected).label));
			$.append($$anchor, fragment_1);
		};

		var consequent_5 = ($$anchor) => {
			var p_1 = root_4();
			var text_2 = $.only_child(p_1, true);

			$.template_effect(() => $.set_text(text_2, fallback_label()));
			$.append($$anchor, p_1);
		};

		$.if(node_2, ($$render) => {
			if (loading()) $$render(consequent_2); else if ($.get(selected)) $$render(consequent_4, 1); else if (fallback_label()) $$render(consequent_5, 2);
		});
	}

	var span_1 = $.sibling(node_2, 2);
	var node_6 = $.child(span_1);

	Icon(node_6, { icon: 'mi:select' });
	$.reset(span_1);
	$.reset(button);
	$.action(button, ($$node) => popperRef?.($$node));
	$.reset(div_1);

	var node_7 = $.sibling(div_1, 2);

	{
		var consequent_11 = ($$anchor) => {
			var div_4 = root_11();
			var node_8 = $.child(div_4);

			{
				var consequent_8 = ($$anchor) => {
					var div_5 = root_8();

					$.each(div_5, 21, options, $.index, ($$anchor, option, i) => {
						const has_submenu_items = $.derived(() => $.get(option).suboptions?.length > 0);
						var fragment_2 = root_7();
						var div_6 = $.first_child(fragment_2);
						var button_1 = $.child(div_6);
						let classes_1;
						var node_9 = $.child(button_1);

						Icon(node_9, {
							get icon() {
								return $.get(option).icon;
							}
						});

						var span_2 = $.sibling(node_9, 2);
						var text_3 = $.only_child(span_2, true);

						$.reset(button_1);

						var node_10 = $.sibling(button_1, 2);

						{
							var consequent_6 = ($$anchor) => {
								var button_2 = root_5();
								var node_11 = $.child(button_2);

								Icon(node_11, { icon: 'material-symbols:chevron-right' });
								$.reset(button_2);

								$.delegated('click', button_2, () => {
									$.set(
										active_submenu,
										{
											title: $.get(option).label,
											options: $.get(option).suboptions
										},
										true
									);
								});

								$.append($$anchor, button_2);
							};

							$.if(node_10, ($$render) => {
								if ($.get(has_submenu_items)) $$render(consequent_6);
							});
						}

						$.reset(div_6);

						var node_12 = $.sibling(div_6, 2);

						{
							var consequent_7 = ($$anchor) => {
								var hr = root_6();

								$.append($$anchor, hr);
							};

							var d = $.derived(() => dividers().includes(i));

							$.if(node_12, ($$render) => {
								if ($.get(d)) $$render(consequent_7);
							});
						}

						$.template_effect(() => {
							button_1.disabled = $.get(option).disabled;
							classes_1 = $.set_class(button_1, 1, 'svelte-fn7uzq', null, classes_1, { active: label() === $.get(option).label });
							$.set_text(text_3, $.get(option).label);
						});

						$.delegated('click', button_1, (e) => {
							$.set(manually_selected, true);

							if ($.get(option).on_click) {
								$.set(showing_dropdown, false);
								$.get(option).on_click(e);
							} else {
								$.set(showing_dropdown, false);
								dispatch('input', $.get(option).value);
							}
						});

						$.append($$anchor, fragment_2);
					});

					$.reset(div_5);
					$.append($$anchor, div_5);
				};

				var consequent_10 = ($$anchor) => {
					var div_7 = root_10();
					var header = $.child(div_7);
					var span_3 = $.child(header);
					var text_4 = $.only_child(span_3, true);
					var button_3 = $.sibling(span_3, 2);
					var node_13 = $.child(button_3);

					Icon(node_13, { icon: 'carbon:close' });
					$.reset(button_3);
					$.reset(header);

					var div_8 = $.sibling(header, 2);
					var node_14 = $.child(div_8);

					{
						var consequent_9 = ($$anchor) => {};

						var alternate = ($$anchor) => {
							var fragment_3 = $.comment();
							var node_15 = $.first_child(fragment_3);

							$.each(node_15, 17, () => $.get(active_submenu).options, $.index, ($$anchor, $$item, $$index_1, $$array) => {
								let label = () => $.get($$item).label;
								let value = () => $.get($$item).value;
								let onclick = () => $.get($$item).onclick;
								var div_9 = root_9();
								var button_4 = $.child(div_9);
								var text_5 = $.only_child(button_4, true);

								$.reset(div_9);
								$.template_effect(() => $.set_text(text_5, label()));

								$.delegated('click', button_4, () => {
									$.set(showing_dropdown, false);
									$.set(active_submenu, null);

									if (onclick()) {
										onclick()();
									} else {
										dispatch('input', value());
									}
								});

								$.append($$anchor, div_9);
							});

							$.append($$anchor, fragment_3);
						};

						$.if(node_14, ($$render) => {
							if (typeof options() === 'function') $$render(consequent_9); else $$render(alternate, -1);
						});
					}

					$.reset(div_8);
					$.reset(div_7);
					$.template_effect(() => $.set_text(text_4, $.get(active_submenu).title));
					$.delegated('click', button_3, () => $.set(active_submenu, null));
					$.transition(1, div_7, () => fade, () => ({ duration: 100 }));
					$.append($$anchor, div_7);
				};

				$.if(node_8, ($$render) => {
					if (!$.get(active_submenu)) $$render(consequent_8); else if ($.get(active_submenu)) $$render(consequent_10, 1);
				});
			}

			$.reset(div_4);
			$.action(div_4, ($$node) => popperContent?.($$node));
			$.transition(1, div_4, () => fade, () => ({ duration: 100 }));
			$.append($$anchor, div_4);
		};

		$.if(node_7, ($$render) => {
			if ($.get(showing_dropdown)) $$render(consequent_11);
		});
	}

	$.reset(div);
	$.action(div, ($$node) => clickOutside?.($$node));

	$.template_effect(() => {
		$.set_class(div, 1, `Select ${variant() ?? ''}`, 'svelte-fn7uzq');
		$.set_attribute(button, 'id', select_id);
		classes = $.set_class(button, 1, 'primary svelte-fn7uzq', null, classes, { highlighted: $.get(highlighted) });
	});

	$.event('click_outside', div, () => $.set(showing_dropdown, false));
	$.delegated('click', button, () => $.set(showing_dropdown, !$.get(showing_dropdown)));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);