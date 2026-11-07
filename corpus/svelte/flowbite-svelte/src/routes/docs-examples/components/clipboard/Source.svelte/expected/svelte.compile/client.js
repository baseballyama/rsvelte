import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Clipboard, Label, Helper } from "flowbite-svelte";
import { CheckOutline, ClipboardCleanSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> Copied`, 1);
var root_1 = $.from_html(`<!> Copy code`, 1);

var root_2 = $.from_html(`<div class="w-full max-w-lg space-y-1"><!> <div class="relative h-64 rounded-lg bg-gray-50 p-4 dark:bg-gray-700"><div class="max-h-full overflow-scroll"><pre><code id="code-block" class="text-sm whitespace-pre text-gray-500 dark:text-gray-400">  
    &#x3C;div class="space-y-2"&#x3E;
        &#x3C;Label for="url-shortener"&#x3E;Shorten URL:&#x3C;/Label&#x3E;
        &#x3C;ButtonGroup&#x3E;
        &#x3C;Button color="primary"&#x3E;Generate&#x3C;/Button&#x3E;
        &#x3C;Input id="url-shortener" bind:value readonly disabled class="w-64" /&#x3E;
        &#x3C;/ButtonGroup&#x3E;
        &#x3C;Helper&#x3E;Make sure that your URL is valid&#x3C;/Helper&#x3E;
    &#x3C;/div&#x3E;
            </code></pre></div> <!></div> <!></div>`);

export default function Source($$anchor) {
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
	var node = $.child(div);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Copy source code block:');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.sibling($.child(div_1), 2);

	{
		let $0 = $.derived(() => $.get(success) ? "alternative" : "light");

		Clipboard(node_1, {
			get color() {
				return $.get($0);
			},
			size: 'sm',
			class: 'absolute end-2 top-2 h-8 px-2.5 font-medium focus:ring-0',
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
				var node_2 = $.first_child(fragment);

				{
					var consequent = ($$anchor) => {
						var fragment_1 = root();
						var node_3 = $.first_child(fragment_1);

						CheckOutline(node_3, { class: 'h-3 w-3' });
						$.next();
						$.append($$anchor, fragment_1);
					};

					var alternate = ($$anchor) => {
						var fragment_2 = root_1();
						var node_4 = $.first_child(fragment_2);

						ClipboardCleanSolid(node_4, { class: 'h-3 w-3' });
						$.next();
						$.append($$anchor, fragment_2);
					};

					$.if(node_2, ($$render) => {
						if ($.get(success)) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_1);

	var node_5 = $.sibling(div_1, 2);

	Helper(node_5, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Configure Tailwind CSS and Flowbite before copying the code');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}