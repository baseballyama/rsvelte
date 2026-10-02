import * as $ from 'svelte/internal/server';
import { Collapsible } from "bits-ui";
import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";

export default function Collapsible_hidden_until_found_demo($$renderer) {
	$$renderer.push(`<div class="flex w-full max-w-md flex-col gap-4"><div class="border-border bg-background-alt absolute left-4 top-4 flex flex-col gap-2 rounded-xl border p-4"><div class="text-foreground-alt flex flex-col gap-2 text-sm"><span>Try searching for "searchable content" on this page</span> <code class="bg-muted w-fit rounded px-1 py-0.5 text-xs">(Ctrl+F / Cmd+F)</code></div></div> `);

	if (Collapsible.Root) {
		$$renderer.push('<!--[-->');

		Collapsible.Root($$renderer, {
			class: 'flex flex-col gap-3',
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex items-center justify-between gap-4"><h4 class="text-[15px] font-medium">FAQ: How does search work?</h4> `);

				if (Collapsible.Trigger) {
					$$renderer.push('<!--[-->');

					Collapsible.Trigger($$renderer, {
						class: 'rounded-9px border-border-input bg-background-alt text-foreground shadow-btn hover:bg-muted inline-flex h-10 w-10 items-center justify-center border transition-all active:scale-[0.98]',
						'aria-label': 'Toggle FAQ answer',
						children: ($$renderer) => {
							CaretUpDown($$renderer, { class: 'size-4', weight: 'bold' });
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</div> `);

				if (Collapsible.Content) {
					$$renderer.push('<!--[-->');

					Collapsible.Content($$renderer, {
						hiddenUntilFound: true,
						class: 'data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden',
						children: ($$renderer) => {
							$$renderer.push(`<div class="bg-background border-border rounded-lg border p-4 text-[14px] leading-relaxed"><p class="mb-3">This collapsible contains <strong>searchable content</strong> that demonstrates
					the <code class="bg-muted rounded px-1 py-0.5 text-xs">hiddenUntilFound</code> feature.
					When you search for text within this collapsed section, the browser will automatically
					expand it to show the matching results.</p></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</div>`);
}