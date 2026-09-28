import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip/index.js';
import { cn } from '$lib/utils.js';
import Check from '@lucide/svelte/icons/check';
import Copy from '@lucide/svelte/icons/copy';

export default function Input_54($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);
		let copied = false;
		let inputElement = null;

		async function handleCopy() {
			if (!inputElement) return;

			await navigator.clipboard.writeText(inputElement.value);
			copied = true;

			setTimeout(
				() => {
					copied = false;
				},
				1500
			);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="*:not-first:mt-2">`);

			Label($$renderer, {
				for: uid,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Copy to clipboard`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="relative">`);

			Input($$renderer, {
				id: uid,
				class: 'pe-9',
				type: 'text',
				value: 'npx sv create my-app',
				readonly: true,
				get ref() {
					return inputElement;
				},

				set ref($$value) {
					inputElement = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			TooltipProvider($$renderer, {
				children: ($$renderer) => {
					Tooltip($$renderer, {
						children: ($$renderer) => {
							{
								function child($$renderer, { props }) {
									$$renderer.push(`<button${$.attributes({ ...props })}><div${$.attr_class($.clsx(cn('transition-all', copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0')))}>`);
									Check($$renderer, { class: 'stroke-emerald-500', size: 16, 'aria-hidden': 'true' });
									$$renderer.push(`<!----></div> <div${$.attr_class($.clsx(cn('absolute transition-all', copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100')))}>`);
									Copy($$renderer, { size: 16, 'aria-hidden': 'true' });
									$$renderer.push(`<!----></div></button>`);
								}

								TooltipTrigger($$renderer, {
									onclick: handleCopy,
									class: 'text-muted-foreground/80 ring-offset-background hover:text-foreground focus-visible:border-ring focus-visible:text-foreground focus-visible:ring-ring/30 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg border border-transparent transition-shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:cursor-not-allowed',
									'aria-label': copied ? 'Copied' : 'Copy to clipboard',
									disabled: copied,
									child,
									$$slots: { child: true }
								});
							}

							$$renderer.push(`<!----> `);

							TooltipContent($$renderer, {
								class: 'border-input bg-popover text-muted-foreground border px-2 py-1 text-xs',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Copy to clipboard`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}