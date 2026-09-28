import * as $ from 'svelte/internal/server';
import { usePreviewControls } from "@components/preview-ctx.svelte";
import Preview from "@components/preview.svelte";
import { getters } from "melt";
import { Toaster } from "melt/builders";
import { Progress } from "melt/components";
import { fly } from "svelte/transition";
import Close from "~icons/material-symbols/close-rounded";

export default function Toaster_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const controls = usePreviewControls({
			hover: {
				type: "select",
				label: "Hover",
				options: ["pause", "pause-all"],
				defaultValue: "pause-all"
			},
			closeDelay: {
				type: "number",
				min: 0,
				max: 10000,
				defaultValue: 3000,
				label: "Close Delay"
			}
		});

		const toastData = [
			{
				title: "Success",
				description: "Congratulations! It worked!",
				variant: "success"
			},

			{
				title: "Warning",
				description: "Please check again.",
				variant: "warning"
			},

			{
				title: "Error",
				description: "Something did not work!",
				variant: "error"
			}
		];

		const toaster = new Toaster({ ...getters(controls) });

		function addRandomToast() {
			toaster.addToast({
				data: toastData[Math.floor(Math.random() * toastData.length)]
			});
		}

		Preview($$renderer, {
			class: 'text-center',
			children: ($$renderer) => {
				$$renderer.push(`<button class="mx-auto block rounded-xl bg-gray-600 px-4 py-2 font-semibold text-white transition-all hover:cursor-pointer hover:bg-gray-500 active:bg-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-500/50 dark:active:bg-gray-600/50">Show Toast</button> <div${$.attributes(
					{
						...toaster.root,
						class: 'fixed !bottom-4 !right-4 flex w-[300px] flex-col'
					},
					'svelte-1n95umn',
					void 0,
					{ '--toasts': toaster.toasts.length }
				)}><!--[-->`);

				const each_array = $.ensure_array_like(toaster.toasts);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let toast = each_array[i];

					$$renderer.push(`<div${$.attributes(
						{
							class: 'h-(--toast-height) relative flex w-full flex-col justify-center rounded-xl bg-white px-4 text-left transition dark:bg-gray-800',
							...toast.content
						},
						'svelte-1n95umn',
						void 0,
						{ '--n': toaster.toasts.length - i }
					)}><h3${$.attributes(
						{
							...toast.title,
							class: 'whitespace-nowrap text-sm font-medium'
						},
						'svelte-1n95umn'
					)}>${$.escape(toast.data.title)}</h3> `);

					if (toast.data.description) {
						$$renderer.push(`<!--[0--><div${$.attributes(
							{
								...toast.description,
								class: 'text-xs text-gray-700 dark:text-gray-300'
							},
							'svelte-1n95umn'
						)}>${$.escape(toast.data.description)}</div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <button${$.attributes(
						{
							...toast.close,
							'aria-label': 'dismiss toast',
							class: 'absolute right-1 top-1 bg-transparent text-gray-300 hover:text-gray-400 dark:hover:text-gray-100'
						},
						'svelte-1n95umn'
					)}>`);

					Close($$renderer, { class: 'h-3.5 w-3.5' });
					$$renderer.push(`<!----></button> `);

					if (toast.closeDelay !== 0) {
						$$renderer.push(`<!--[0--><div class="absolute bottom-4 right-4 h-[4px] w-[30px] overflow-hidden rounded-full">`);

						{
							function children($$renderer, progress) {
								$$renderer.push(`<div${$.attributes(
									{
										...progress.root,
										class: 'relative h-full w-full overflow-hidden bg-gray-200 dark:bg-gray-950'
									},
									'svelte-1n95umn'
								)}><div${$.attributes(
									{
										...progress.progress,
										class: 'h-full w-full -translate-x-[var(--progress)]'
									},
									'svelte-1n95umn',
									{
										'bg-green-400': toast.data.variant === "success",
										'bg-orange-400': toast.data.variant === "warning",
										'bg-red-500': toast.data.variant === "error"
									}
								)}></div></div>`);
							}

							Progress($$renderer, {
								value: toast.percentage,
								children,
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});
	});
}