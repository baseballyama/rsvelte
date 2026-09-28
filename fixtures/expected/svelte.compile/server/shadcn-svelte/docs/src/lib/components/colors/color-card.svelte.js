import * as $ from 'svelte/internal/server';
import CheckIcon from "@lucide/svelte/icons/check";
import ClipboardIcon from "@lucide/svelte/icons/clipboard";
import { PersistedState } from "runed";
import { toast } from "svelte-sonner";
import { scale } from "svelte/transition";
import * as Select from "$lib/registry/ui/select/index.js";
import { getColors } from "$lib/components/colors/colors.js";
import { AspectRatio } from "$lib/registry/ui/aspect-ratio/index.js";

export default function Color_card($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const formats = [
			{ format: "className", hint: "bg-slate-100" },
			{ format: "hex", hint: "#f8fafc" },
			{ format: "rgb", hint: "248 250 252" },
			{ format: "hsl", hint: "210 40% 98%" },
			{ format: "oklch", hint: "0.98 0.00 248" }
		];

		const selectedFormat = new PersistedState("color-format-preference", formats[0].format);
		const colors = getColors();
		let copied = void 0;

		async function copy(shade) {
			copied = shade.className;

			const text = shade[selectedFormat.current];

			await navigator.clipboard.writeText(text);
			toast.success(`Copied ${text} to clipboard!`);

			setTimeout(
				() => {
					copied = undefined;
				},
				1000
			);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex w-full flex-col gap-8"><!--[-->`);

			const each_array = $.ensure_array_like(colors);

			for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
				let color = each_array[$$index_2];

				$$renderer.push(`<div class="flex w-full flex-col gap-2 rounded-lg border p-2"><div class="flex place-items-center justify-between"><h2>${$.escape(`${color.name[0].toUpperCase()}${color.name.slice(1)}`)}</h2> `);

				if (Select.Root) {
					$$renderer.push('<!--[-->');

					Select.Root($$renderer, {
						type: 'single',
						get value() {
							return selectedFormat.current;
						},

						set value($$value) {
							selectedFormat.current = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Select.Trigger) {
								$$renderer.push('<!--[-->');

								Select.Trigger($$renderer, {
									class: 'h-7 w-fit text-xs',
									children: ($$renderer) => {
										$$renderer.push(`<span class="me-2"><span class="font-bold">Format:</span> <span class="font-mono text-muted-foreground">${$.escape(selectedFormat.current)}</span></span>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Select.Content) {
								$$renderer.push('<!--[-->');

								Select.Content($$renderer, {
									align: 'end',
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array_1 = $.ensure_array_like(formats);

										for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
											let format = each_array_1[$$index];

											if (Select.Item) {
												$$renderer.push('<!--[-->');

												Select.Item($$renderer, {
													value: format.format,
													children: ($$renderer) => {
														$$renderer.push(`<span><span>${$.escape(format.format)}</span> <span class="font-mono text-muted-foreground">${$.escape(format.hint)}</span></span>`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(`<!--]-->`);
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

				$$renderer.push(`</div> <div class="flex flex-col place-items-end md:flex-row md:gap-2"><!--[-->`);

				const each_array_2 = $.ensure_array_like(color.colors);

				for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
					let shade = each_array_2[$$index_1];

					$$renderer.push(`<button type="button" class="group w-full flex-1 shrink-0 md:h-full md:w-auto"><div class="relative"><div class="hidden md:block">`);

					AspectRatio($$renderer, {
						ratio: 12 / 16,
						children: ($$renderer) => {
							$$renderer.push(`<div class="size-full rounded-lg"${$.attr_style(`background-color: ${$.stringify(shade.hex)};`)}></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div> <div class="block h-36 w-full rounded-lg md:hidden"${$.attr_style(`background-color: ${$.stringify(shade.hex)};`)}></div> <div class="absolute end-2 top-2 opacity-0 transition-all group-hover:opacity-100"${$.attr_style(`color: ${$.stringify(shade.foreground)};`)}>`);

					if (copied === shade.className) {
						$$renderer.push(`<!--[0--><div>`);
						CheckIcon($$renderer, { class: 'size-4' });
						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div>`);
						ClipboardIcon($$renderer, { class: 'size-4' });
						$$renderer.push(`<!----></div>`);
					}

					$$renderer.push(`<!--]--></div></div> <span class="hidden py-1 font-mono text-sm text-nowrap text-muted-foreground transition-colors group-hover:text-foreground xl:block">${$.escape(shade.className)}</span> <span class="block py-1 font-mono text-sm text-nowrap text-muted-foreground transition-colors group-hover:text-foreground xl:hidden">${$.escape(shade.className.split("-")[1])}</span></button>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}