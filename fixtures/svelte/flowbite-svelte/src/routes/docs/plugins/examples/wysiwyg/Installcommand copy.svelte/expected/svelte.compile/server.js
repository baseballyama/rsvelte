import * as $ from 'svelte/internal/server';
import { Clipboard } from "$lib";
import { CheckOutline, ClipboardCleanSolid } from "flowbite-svelte-icons";

export default function Installcommand_copy($$renderer) {
	const tiptapVersion = __TIPTAP__;
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
		$$renderer.push(`<div class="relative"><div class="mt-9 overflow-x-scroll rounded-lg bg-gray-50 p-4 dark:bg-gray-700"><pre><code id="code-block">pnpm i -D @flowbite-svelte-plugins/texteditor@latest lowlight @tiptap/core@${$.escape(tiptapVersion)}
</code></pre></div> `);

		Clipboard($$renderer, {
			color: success ? "alternative" : "light",
			size: 'sm',
			class: 'absolute end-2 -top-9 h-8 px-2.5 font-medium focus:ring-0',
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

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}