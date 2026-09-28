import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { clickOutside } from "@svar-ui/lib-dom";
import MultiSelect from "../MultiSelect.svelte";

var root = $.from_html(`<div class="wx-value svelte-q9un91"><!></div>`);

export default function MultiSelect_1($$anchor, $$props) {
	$.push($$props, true);

	const config = $.proxy($$props.editor?.config || {});
	const options = $.derived(() => $$props.editor?.options ?? []);
	const value = $.derived(() => $$props.editor?.value || []);
	const text = $.derived(() => $$props.editor?.renderedValue);
	const dropdownOptions = $.derived(() => ({ trackScroll: true, ...config.dropdown || {} }));

	function updateValue({ value }) {
		$$props.onapply(value);
	}

	var div = root();
	var node = $.child(div);

	MultiSelect(node, {
		get value() {
			return $.get(value);
		},

		get options() {
			return $.get(options);
		},

		get text() {
			return $.get(text);
		},

		get template() {
			return config.template;
		},

		get cell() {
			return config.cell;
		},

		get clear() {
			return config.clear;
		},

		get dropdown() {
			return $.get(dropdownOptions);
		},
		autoOpen: true,
		onchange: updateValue,
		get onaction() {
			return $$props.onaction;
		}
	});

	$.reset(div);
	$.action(div, ($$node, $$action_arg) => clickOutside?.($$node, $$action_arg), () => () => $$props.onsave(true));
	$.delegated('click', div, () => $$props.onsave(true));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);