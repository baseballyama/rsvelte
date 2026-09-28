import * as $ from 'svelte/internal/server';
import { Clipboard, Label, Helper } from "flowbite-svelte";
import { CheckOutline, ClipboardCleanSolid } from "flowbite-svelte-icons";

export default function Source($$renderer) {
	let value = "";
	let success = false;

	function onclick(ev) {
		const target = ev.target;
		const codeBlock = target.ownerDocument.querySelector("#code-block");

		if (codeBlock) {
			value = codeBlock.textContent || "";
		}
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="w-full max-w-lg space-y-1">`);

		Label($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Copy source code block:`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="relative h-64 rounded-lg bg-gray-50 p-4 dark:bg-gray-700"><div class="max-h-full overflow-scroll"><pre><code id="code-block" class="text-sm whitespace-pre text-gray-500 dark:text-gray-400">  
    &lt;div class="space-y-2">
        &lt;Label for="url-shortener">Shorten URL:&lt;/Label>
        &lt;ButtonGroup>
        &lt;Button color="primary">Generate&lt;/Button>
        &lt;Input id="url-shortener" bind:value readonly disabled class="w-64" />
        &lt;/ButtonGroup>
        &lt;Helper>Make sure that your URL is valid&lt;/Helper>
    &lt;/div>
            </code></pre></div> `);

		Clipboard($$renderer, {
			color: success ? "alternative" : "light",
			size: 'sm',
			class: 'absolute end-2 top-2 h-8 px-2.5 font-medium focus:ring-0',
			onclick,
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			},

			get success() {
				return success;
			},

			set success($$value) {
				success = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				if (success) {
					$$renderer.push('<!--[0-->');
					CheckOutline($$renderer, { class: 'h-3 w-3' });
					$$renderer.push(`<!----> Copied`);
				} else {
					$$renderer.push('<!--[-1-->');
					ClipboardCleanSolid($$renderer, { class: 'h-3 w-3' });
					$$renderer.push(`<!----> Copy code`);
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		Helper($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Configure Tailwind CSS and Flowbite before copying the code`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}