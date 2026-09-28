import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import { Portal } from "../index.js";
import Popup from "./Popup.svelte";
import InlineDropdown from "./helpers/InlineDropdown.svelte";

export default function Dropdown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			position = "bottom",
			align = "start",
			autoFit = true,
			inline = false,
			oncancel,
			width = "100%",
			$$slots,
			$$events,
			...props
		} = $$props;

		let target = void 0;
		let node = void 0;
		const at = $.derived(() => `${position}-${align}`);

		onMount(() => {
			// get the parent element before
			// the popup is moved to the portal
			target = node.parentNode;
		});

		if (inline) {
			$$renderer.push('<!--[0-->');
			InlineDropdown($$renderer, $.spread_props([{ oncancel, position, align, autoFit, width }, props]));
		} else {
			$$renderer.push('<!--[-1-->');

			Portal($$renderer, {
				children: ($$renderer) => {
					Popup($$renderer, $.spread_props([{ parent: target, at: at(), oncancel, width }, props]));
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--> <span class="wx-portal-node svelte-5utc01"></span>`);
	});
}