import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import { ColorBoard, Dropdown } from "@svar-ui/svelte-core";
import { clickOutside } from "@svar-ui/lib-dom";

export default function ColorEditor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { editor, onsave, onapply, oncancel } = $$props;
		let value = editor.value;

		function updateValue({ value, input }) {
			if (input) onapply(value); else onsave();
		}

		let node;

		onMount(() => {
			node.focus();

			if (window.getSelection) {
				window.getSelection().removeAllRanges();
			}
		});

		$$renderer.push(`<div class="value svelte-k0tcm9" tabindex="0">${$.escape(value)}</div> `);

		Dropdown($$renderer, {
			width: "auto",
			trackScroll: true,
			oncancel,
			children: ($$renderer) => {
				$$renderer.push(`<div>`);
				ColorBoard($$renderer, { value, onchange: updateValue, button: true });
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}