import * as $ from 'svelte/internal/server';
import { Input, Tooltip } from "$lib";
import Check from "./icons/Check.svelte";
import Clipboard from "./icons/Clipboard.svelte";

export default function CopyCliboardInput($$renderer, $$props) {
	let { class: className = "" } = $$props;
	const show = (ev) => ev.newState == "open" || set_tooltip(false);
	const text_copied = "Copied!";
	const text_not_copied = "Copy to clipboard";
	let placeholder = "pnpm i -D flowbite-svelte flowbite";
	let tooltip_text = text_not_copied;

	function set_tooltip(copied) {
		tooltip_text = copied ? text_copied : text_not_copied;
	}

	const copyToClipboard = async () => {
		if (tooltip_text === text_copied) return;

		const REG_HEX = /&#x([a-fA-F0-9]+);/g;

		const decodedText = placeholder.replace(REG_HEX, function (_match, group1) {
			const num = parseInt(group1, 16);

			return String.fromCharCode(num);
		});

		await window.navigator.clipboard.writeText(decodedText);
		set_tooltip(true);
	};

	{
		function right($$renderer) {
			$$renderer.push(`<div class="flex items-center ps-32"><button class="hover:text-primary-700 px-1 py-2">`);

			if (tooltip_text == text_not_copied) {
				$$renderer.push('<!--[0-->');
				Clipboard($$renderer, {});
			} else {
				$$renderer.push('<!--[-1-->');
				Check($$renderer, {});
			}

			$$renderer.push(`<!--]--></button> `);

			Tooltip($$renderer, {
				ontoggle: show,
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(tooltip_text)}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		Input($$renderer, {
			size: 'lg',
			placeholder,
			readonly: true,
			class: `focus:ring-primary-600 focus:border-primary-600 py-3 text-sm sm:text-sm md:min-w-[315px] ${$.stringify(className)}`,
			right,
			$$slots: { right: true }
		});
	}
}