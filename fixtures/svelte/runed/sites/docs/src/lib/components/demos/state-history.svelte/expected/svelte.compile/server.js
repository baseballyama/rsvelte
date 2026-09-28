import * as $ from 'svelte/internal/server';
import { StateHistory } from "runed";
import { Button, DemoContainer } from "@svecodocs/kit";

export default function State_history($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;
		const history = new StateHistory(() => count, (c) => count = c, { capacity: 10 });

		function format(ts) {
			return new Date(ts).toLocaleString();
		}

		DemoContainer($$renderer, {
			class: 'flex flex-col gap-4',
			children: ($$renderer) => {
				$$renderer.push(`<p class="mt-0">Count: ${$.escape(count)}</p> <div class="flex items-center gap-2">`);

				Button($$renderer, {
					size: 'sm',
					variant: 'brand',
					onclick: () => count++,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Increment`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'sm',
					variant: 'brand',
					onclick: () => count--,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Decrement`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <span class="px-2">/</span> `);

				Button($$renderer, {
					size: 'sm',
					variant: 'ghost',
					disabled: !history.canUndo,
					onclick: history.undo,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Undo`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'sm',
					variant: 'ghost',
					disabled: !history.canRedo,
					onclick: history.redo,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Redo`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="mt-4"><p class="text-muted-foreground m-0 select-none">History (limited to 10 records for demo)</p> <div class="bg-background-secondary mt-2 rounded-md border px-3 py-2"><!--[-->`);

				const each_array = $.ensure_array_like(history.log.toReversed());

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let event = each_array[i];

					$$renderer.push(`<div class="flex items-center gap-4 font-mono"><span class="text-muted-foreground/75">${$.escape(format(event.timestamp))}</span> <span>${$.escape(`{ value: ${event.snapshot} }`)}</span></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			},
			$$slots: { default: true }
		});
	});
}