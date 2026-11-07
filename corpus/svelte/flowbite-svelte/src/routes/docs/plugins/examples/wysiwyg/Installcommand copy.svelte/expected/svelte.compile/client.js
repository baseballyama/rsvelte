import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Clipboard } from "$lib";
import { CheckOutline, ClipboardCleanSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> Copied`, 1);
var root_1 = $.from_html(`<!> Copy code`, 1);
var root_2 = $.from_html(`<div class="relative"><div class="mt-9 overflow-x-scroll rounded-lg bg-gray-50 p-4 dark:bg-gray-700"><pre><code id="code-block"> </code></pre></div> <!></div>`);

export default function Installcommand_copy($$anchor) {
	const tiptapVersion = __TIPTAP__;
	let value = $.state("");
	let success = $.state(false);

	function onclick(ev) {
		const target = ev.target;
		const codeBlock = target.ownerDocument.querySelector("#code-block");

		if (codeBlock) {
			$.set(value, codeBlock.textContent || "", true);
		}
	}

	var div = root_2();
	var div_1 = $.child(div);
	var pre = $.child(div_1);
	var code = $.child(pre);
	var text = $.only_child(code);

	$.reset(pre);
	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	{
		let $0 = $.derived(() => $.get(success) ? "alternative" : "light");

		Clipboard(node, {
			get color() {
				return $.get($0);
			},
			size: 'sm',
			class: 'absolute end-2 -top-9 h-8 px-2.5 font-medium focus:ring-0',
			onclick,
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},

			get success() {
				return $.get(success);
			},

			set success($$value) {
				$.set(success, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				{
					var consequent = ($$anchor) => {
						var fragment_1 = root();
						var node_2 = $.first_child(fragment_1);

						CheckOutline(node_2, { class: 'h-3 w-3' });
						$.next();
						$.append($$anchor, fragment_1);
					};

					var alternate = ($$anchor) => {
						var fragment_2 = root_1();
						var node_3 = $.first_child(fragment_2);

						ClipboardCleanSolid(node_3, { class: 'h-3 w-3' });
						$.next();
						$.append($$anchor, fragment_2);
					};

					$.if(node_1, ($$render) => {
						if ($.get(success)) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);

	$.template_effect(() => $.set_text(text, `pnpm i -D @flowbite-svelte-plugins/texteditor@latest lowlight @tiptap/core@${tiptapVersion ?? ''}
`));

	$.append($$anchor, div);
}