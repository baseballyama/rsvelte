import * as $ from 'svelte/internal/server';
import { clickOutside } from "@svar-ui/lib-dom";
import MultiSelect from "../MultiSelect.svelte";

export default function MultiSelect_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { editor, onaction, onsave, onapply } = $$props;
		const config = editor?.config || {};
		const options = $.derived(() => editor?.options ?? []);
		const value = $.derived(() => editor?.value || []);
		const text = $.derived(() => editor?.renderedValue);
		const dropdownOptions = $.derived(() => ({ trackScroll: true, ...config.dropdown || {} }));

		function updateValue({ value }) {
			onapply(value);
		}

		$$renderer.push(`<div class="wx-value svelte-q9un91">`);

		MultiSelect($$renderer, {
			value: value(),
			options: options(),
			text: text(),
			template: config.template,
			cell: config.cell,
			clear: config.clear,
			dropdown: dropdownOptions(),
			autoOpen: true,
			onchange: updateValue,
			onaction
		});

		$$renderer.push(`<!----></div>`);
	});
}