import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/buttons/Button.svelte";
import clsx from "clsx";
import { clipboard } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'embedded',
	'value',
	'success',
	'onclick',
	'class'
]);

export default function Clipboard($$anchor, $$props) {
	$.push($$props, true);

	let embedded = $.prop($$props, 'embedded', 3, false),
		value = $.prop($$props, 'value', 11, ""),
		success = $.prop($$props, 'success', 15, false),
		className = $.prop($$props, 'class', 3, ""),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("clipboard"));

	const copyToClipboard = async (ev) => {
		$$props.onclick?.(ev);

		if (ev.defaultPrevented) return;
		if (success()) return;

		success(true);

		const REG_HEX = /&#x([a-fA-F0-9]+);/g;

		const decodedText = value().replace(REG_HEX, function (_match, group1) {
			const num = parseInt(group1, 16);

			return String.fromCharCode(num);
		});

		try {
			await window.navigator.clipboard.writeText(decodedText);
		} catch(error) {
			console.error("Failed to copy to clipboard:", error);
			success(false);

			return;
		}

		setTimeout(
			() => {
				success(false);
			},
			2000
		);
	};

	{
		let $0 = $.derived(() => clipboard({ embedded: embedded(), class: clsx($.get(theme), className()) }));

		Button($$anchor, $.spread_props({ onclick: copyToClipboard }, () => restProps, {
			get class() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop, success);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	}

	$.pop();
}