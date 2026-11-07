import * as $ from 'svelte/internal/server';
import Button from "$lib/buttons/Button.svelte";
import clsx from "clsx";
import { clipboard } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function Clipboard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			embedded = false,
			value = "",
			success = false,
			onclick,
			class: className = "",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("clipboard"));

		const copyToClipboard = async (ev) => {
			onclick?.(ev);

			if (ev.defaultPrevented) return;
			if (success) return;

			success = true;

			const REG_HEX = /&#x([a-fA-F0-9]+);/g;

			const decodedText = value.replace(REG_HEX, function (_match, group1) {
				const num = parseInt(group1, 16);

				return String.fromCharCode(num);
			});

			try {
				await window.navigator.clipboard.writeText(decodedText);
			} catch(error) {
				console.error("Failed to copy to clipboard:", error);
				success = false;

				return;
			}

			setTimeout(
				() => {
					success = false;
				},
				2000
			);
		};

		Button($$renderer, $.spread_props([
			{ onclick: copyToClipboard },
			restProps,
			{
				class: clipboard({ embedded, class: clsx(theme(), className) }),
				children: ($$renderer) => {
					children?.($$renderer, success);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			}
		]));

		$.bind_props($$props, { value, success });
	});
}