import * as $ from 'svelte/internal/server';
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

export default function Component_preview_tabs($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			align = "center",
			component,
			example,
			children,
			name,
			hideCode = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let codeVisible = false;

		function ExampleFallback($$renderer) {
			if (component) {
				$$renderer.push('<!--[0-->');

				const Component = component;

				if (Component) {
					$$renderer.push('<!--[-->');
					Component($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push(`<!--[-1--><p class="text-sm text-muted-foreground">Component <code class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">${$.escape(name)}</code> not found in registry.</p>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn("group relative mt-4 mb-12 flex flex-col overflow-hidden rounded-xl border", className)),
			...restProps
		})}><div data-slot="preview" class="preview flex w-full justify-center data-[align=center]:items-center data-[align=end]:items-end data-[align=start]:items-start" data-llm-ignore=""><div${$.attr('data-align', align)} class="preview flex min-h-[450px] w-full justify-center p-10 data-[align=center]:items-center data-[align=end]:items-end data-[align=start]:items-start">`);

		if (example) {
			$$renderer.push('<!--[0-->');
			example($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
			ExampleFallback($$renderer);
		}

		$$renderer.push(`<!--]--></div></div> `);

		if (!hideCode) {
			$$renderer.push(`<!--[0--><div data-slot="code"${$.attr('data-code-visible', codeVisible)} class="relative overflow-hidden **:data-rehype-pretty-code-figure:m-0! **:data-rehype-pretty-code-figure:rounded-t-none **:data-rehype-pretty-code-figure:border-t data-[code-visible=false]:**:data-rehype-pretty-code-figure:max-h-22 data-[code-visible=false]:**:data-rehype-pretty-code-figure:overflow-hidden **:data-[slot=copy-button]:right-4 **:data-[slot=copy-button]:hidden data-[code-visible=true]:**:data-[slot=copy-button]:flex data-[code-visible=true]:[&amp;_pre]:max-h-72">`);
			children?.($$renderer);
			$$renderer.push(`<!----> `);

			if (!codeVisible) {
				$$renderer.push(`<!--[0--><div class="absolute inset-0 flex items-center justify-center pb-4"><div class="absolute inset-0" style="background: linear-gradient(to top, var(--color-code), color-mix(in oklab, var(--color-code) 60%, transparent), transparent)"></div> `);

				Button($$renderer, {
					type: 'button',
					size: 'sm',
					variant: 'outline',
					class: 'relative z-10 rounded-lg bg-background text-foreground shadow-none hover:bg-muted dark:bg-background dark:text-foreground dark:hover:bg-muted',
					onclick: () => {
						codeVisible = true;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->View Code`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}