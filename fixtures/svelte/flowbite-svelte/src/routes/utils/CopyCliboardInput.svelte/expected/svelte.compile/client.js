import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input, Tooltip } from "$lib";
import Check from "./icons/Check.svelte";
import Clipboard from "./icons/Clipboard.svelte";

var root = $.from_html(`<div class="flex items-center ps-32"><button class="hover:text-primary-700 px-1 py-2"><!></button> <!></div>`);

export default function CopyCliboardInput($$anchor, $$props) {
	let className = $.prop($$props, 'class', 3, "");
	const show = (ev) => ev.newState == "open" || set_tooltip(false);
	const text_copied = "Copied!";
	const text_not_copied = "Copy to clipboard";
	let placeholder = "pnpm i -D flowbite-svelte flowbite";
	let tooltip_text = $.state(text_not_copied);

	function set_tooltip(copied) {
		$.set(tooltip_text, copied ? text_copied : text_not_copied, true);
	}

	const copyToClipboard = async () => {
		if ($.get(tooltip_text) === text_copied) return;

		const REG_HEX = /&#x([a-fA-F0-9]+);/g;

		const decodedText = placeholder.replace(REG_HEX, function (_match, group1) {
			const num = parseInt(group1, 16);

			return String.fromCharCode(num);
		});

		await window.navigator.clipboard.writeText(decodedText);
		set_tooltip(true);
	};

	{
		const right = ($$anchor) => {
			var div = root();
			var button = $.child(div);
			var node = $.child(button);

			{
				var consequent = ($$anchor) => {
					Clipboard($$anchor, {});
				};

				var alternate = ($$anchor) => {
					Check($$anchor, {});
				};

				$.if(node, ($$render) => {
					if ($.get(tooltip_text) == text_not_copied) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(button);

			var node_1 = $.sibling(button, 2);

			Tooltip(node_1, {
				ontoggle: show,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, $.get(tooltip_text)));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.delegated('click', button, copyToClipboard);
			$.append($$anchor, div);
		};

		Input($$anchor, {
			size: 'lg',
			placeholder,
			readonly: true,
			get class() {
				return `focus:ring-primary-600 focus:border-primary-600 py-3 text-sm sm:text-sm md:min-w-[315px] ${className() ?? ''}`;
			},
			right,
			$$slots: { right: true }
		});
	}
}

$.delegate(['click']);