import * as $ from 'svelte/internal/server';
import Preview from "@components/preview.svelte";
import { Popover as PopoverComponent } from "melt/components";
import { Popover } from "melt/builders";
import { usePreviewControls } from "@components/preview-ctx.svelte";

export default function Popover_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const controls = usePreviewControls({
			arrow: { label: "Show arrow", type: "boolean", defaultValue: false }
		});

		const popover = new Popover({ forceVisible: true });

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<button${$.attributes(
					{
						class: 'mx-auto block rounded-xl bg-gray-100 px-4 py-2 font-semibold text-gray-800 transition-all hover:cursor-pointer hover:bg-gray-200 active:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-500/50 dark:active:bg-gray-600/50',
						...popover.trigger
					},
					'svelte-ishmsc'
				)}>psst...</button> <div${$.attributes(
					{
						class: 'w-[260px] overflow-visible rounded-2xl bg-white p-4 shadow-xl dark:bg-gray-800',
						...popover.content
					},
					'svelte-ishmsc'
				)}>`);

				if (controls.arrow) {
					$$renderer.push(`<!--[0--><div${$.attributes({ ...popover.arrow, class: 'size-2 rounded-tl' }, 'svelte-ishmsc')}></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <p class="text-center font-semibold">Can I tell you a secret?</p> <div class="mt-4 flex items-center justify-center gap-4">`);

				{
					function children($$renderer, popover2) {
						$$renderer.push(`<button${$.attributes(
							{
								class: 'border-b-2 border-dashed bg-transparent transition hover:cursor-pointer hover:opacity-75 active:opacity-50',
								...popover2.trigger
							},
							'svelte-ishmsc'
						)}>yes</button> <div${$.attributes(
							{
								...popover2.content,
								class: 'rounded-xl bg-gray-100 p-4 shadow-xl backdrop-blur dark:bg-gray-700'
							},
							'svelte-ishmsc'
						)}>you're awesome</div>`);
					}

					PopoverComponent($$renderer, { forceVisible: true, children, $$slots: { default: true } });
				}

				$$renderer.push(`<!----></div></div>`);
			},
			$$slots: { default: true }
		});
	});
}