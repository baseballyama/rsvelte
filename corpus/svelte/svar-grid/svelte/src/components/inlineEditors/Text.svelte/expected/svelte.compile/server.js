import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import { clickOutside } from "@svar-ui/lib-dom";

export default function Text($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { editor, onsave, onapply } = $$props;
		let value = editor.value || "";

		let $$d = $.derived(() => editor?.config || {}),
			type = $.derived(() => $.fallback($$d().type, "text"));

		let node = void 0;

		onMount(() => node.focus());

		function updateValue() {
			value = node.value;
			onapply(node.value);
		}

		function closeAndSave({ key }) {
			if (key === "Enter") onsave();
		}

		$$renderer.push(`<input class="wx-text svelte-185hkbp"${$.attr('type', type())}${$.attr('value', value)}/>`);
	});
}