import * as $ from 'svelte/internal/server';
import SEOComponent from "$lib/seo/SEO.svelte";
import DocsPageShell from "$lib/components/layout/DocsPageShell.svelte";
import MultipleCode from "$lib/components/ui/code/multiple-code.svelte";
import { H2, H3, Paragraph, Table, Thead, Tbody, Tr, Th, Td } from "$lib/components/markdown/index";
import { docsV2PageMap } from "$lib/config/docs-v2";
import DocsCodeBlock from "$lib/web/docs/DocsCodeBlock.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const pageMeta = docsV2PageMap.mistTheme;

		const buttonSourceCode = [
			{
				filename: "button.svelte",
				lang: "svelte",
				filecode: `\<\script lang="ts" module\>
	import type { WithElementRef } from "bits-ui";
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
	import { type VariantProps, tv } from "tailwind-variants";

	export const buttonVariants = tv({
		base: "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:brightness-95",
				neutral: "bg-foreground text-background hover:brightness-95",
				destructive:
					"text-destructive-foreground bg-destructive shadow-md hover:bg-destructive/90",
				outline:
					"border border-transparent bg-background text-foreground shadow-sm ring-1 shadow-black/15 ring-foreground/10 duration-200 hover:bg-muted/50",
				secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
				ghost: "text-foreground/75 hover:bg-foreground/5 hover:text-foreground",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-9 rounded-md px-4 py-2",
				sm: "h-8 rounded-full px-3 text-sm",
				lg: "h-11 px-6 text-base font-medium",
				icon: "size-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "sm",
		},
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
	export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
		};
\<\/script\>

\<\script lang="ts"\>
	import { cn } from "$lib/utils.js";

	let {
		class: className,
		variant = "default",
		size = "default",
		ref = $bindable(null),
		href = undefined,
		type = "button",
		children,
		...restProps
	}: ButtonProps = $props();
\<\/script\>

{#if href}
	<a
		bind:this={ref}
		class={cn(buttonVariants({ variant, size }), className)}
		{href}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}`
			},

			{
				filename: "index.ts",
				lang: "typescript",
				filecode: `import Root, {
	type ButtonProps,
	type ButtonSize,
	type ButtonVariant,
	buttonVariants,
} from "./button.svelte";

export {
	Root,
	type ButtonProps as Props,
	//
	Root as Button,
	buttonVariants,
	type ButtonProps,
	type ButtonSize,
	type ButtonVariant,
};`
			}
		];

		const cardSourceCode = [
			{
				filename: "card.svelte",
				lang: "svelte",
				filecode: `\<\script module lang="ts"\>
	import type { WithElementRef } from "bits-ui";
	import { type VariantProps, tv } from "tailwind-variants";

	export const cardVariants = tv({
		base: "rounded-xl text-card-foreground",
		variants: {
			variant: {
				default: "border border-transparent bg-card shadow ring-1 ring-foreground/5",
				soft: "bg-foreground/5",
				mixed: "border-foreground.5 border bg-foreground/5",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	});

	export type CardVariant = VariantProps<typeof cardVariants>["variant"];

	export type CardProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: CardVariant;
	};
\<\/script\>

\<\script lang="ts"\>
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		variant = "default",
		...restProps
	}: CardProps = $props();
\<\/script\>

<div bind:this={ref} class={cn(cardVariants({ variant }), className)} {...restProps}>
	{@render children?.()}
</div>`
			},

			{
				filename: "card-header.svelte",
				lang: "svelte",
				filecode: `\<\script lang="ts"\>
	import type { WithElementRef } from "bits-ui";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
\<\/script\>

<div bind:this={ref} class={cn("flex flex-col space-y-1.5 p-6", className)} {...restProps}>
	{@render children?.()}
</div>`
			},

			{
				filename: "card-title.svelte",
				lang: "svelte",
				filecode: `\<\script lang="ts"\>
	import type { WithElementRef } from "bits-ui";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		level = 3,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		level?: 1 | 2 | 3 | 4 | 5 | 6;
	} = $props();
\<\/script\>

<div
	role="heading"
	aria-level={level}
	bind:this={ref}
	class={cn("font-semibold leading-none tracking-tight", className)}
	{...restProps}
>
	{@render children?.()}
</div>`
			},

			{
				filename: "card-description.svelte",
				lang: "svelte",
				filecode: `\<\script lang="ts"\>
	import type { WithElementRef } from "bits-ui";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLParagraphElement>> = $props();
\<\/script\>

<p bind:this={ref} class={cn("text-muted-foreground text-sm", className)} {...restProps}>
	{@render children?.()}
</p>`
			},

			{
				filename: "card-content.svelte",
				lang: "svelte",
				filecode: `\<\script lang="ts"\>
	import type { WithElementRef } from "bits-ui";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
\<\/script\>

<div bind:this={ref} class={cn("p-6 pt-0", className)} {...restProps}>
	{@render children?.()}
</div>`
			},

			{
				filename: "card-footer.svelte",
				lang: "svelte",
				filecode: `\<\script lang="ts"\>
	import type { WithElementRef } from "bits-ui";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
\<\/script\>

<div bind:this={ref} class={cn("p-6 pt-0", className)} {...restProps}>
	{@render children?.()}
</div>`
			},

			{
				filename: "index.ts",
				lang: "typescript",
				filecode: `import Root from "./card.svelte";
import Content from "./card-content.svelte";
import Description from "./card-description.svelte";
import Footer from "./card-footer.svelte";
import Header from "./card-header.svelte";
import Title from "./card-title.svelte";

export {
	Root,
	Content,
	Description,
	Footer,
	Header,
	Title,
	//
	Root as Card,
	Content as CardContent,
	Description as CardDescription,
	Footer as CardFooter,
	Header as CardHeader,
	Title as CardTitle,
};`
			}
		];

		SEOComponent($$renderer, {
			title: pageMeta.seo.title,
			description: pageMeta.seo.description,
			keywords: pageMeta.seo.keywords
		});

		$$renderer.push(`<!----> `);

		DocsPageShell($$renderer, {
			title: 'Mist Theme Setup',
			description: 'Apply Mist theme tokens and update button and card primitives for documentation-style UI styling.',
			children: ($$renderer) => {
				$$renderer.push(`<section>`);

				H2($$renderer, {
					id: 'theme-quickstart',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Theme Quickstart`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Paragraph($$renderer, {
					class: 'mt-1 mb-6 text-muted-foreground',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Add the Mist theme variables to your global stylesheet <code class="rounded-sm bg-secondary px-1">app.css</code> or <code class="rounded-sm bg-secondary px-1">layout.css</code> so Mist primitives resolve
			color, border, and contrast consistently.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				DocsCodeBlock($$renderer, {
					fileName: 'layout.css',
					lang: 'css',
					code: `[data-theme="mist"] .theme-container {
	--radius: 0.625rem;
	--background: var(--color-white);
	--foreground: var(--color-zinc-950);
	--card: var(--color-white);
	--card-foreground: var(--color-zinc-950);
	--popover: var(--color-white);
	--popover-foreground: var(--color-zinc-950);
	--primary: var(--color-indigo-500);
	--primary-foreground: var(--color-white);
	--secondary: var(--color-indigo-100);
	--secondary-foreground: var(--color-indigo-600);
	--muted: var(--color-zinc-100);
	--muted-foreground: var(--color-zinc-600);
	--accent: var(--color-zinc-700);
	--accent-foreground: var(--color-white);
	--destructive: var(--color-red-600);
	--border: var(--color-zinc-200);
	--input: var(--color-zinc-200);
	--ring: var(--color-indigo-500);

	@variant dark {
		--radius: 0.625rem;
		--background: var(--color-white);
		--foreground: var(--color-zinc-950);
		--card: var(--color-white);
		--card-foreground: black;
		--popover: var(--color-white);
		--popover-foreground: var(--color-zinc-950);
		--primary: var(--color-indigo-500);
		--primary-foreground: var(--color-white);
		--secondary: var(--color-indigo-100);
		--secondary-foreground: var(--color-indigo-600);
		--muted: var(--color-zinc-100);
		--muted-foreground: var(--color-zinc-600);
		--accent: var(--color-zinc-700);
		--accent-foreground: var(--color-white);
		--destructive: var(--color-red-600);
		--border: var(--color-zinc-200);
		--input: var(--color-zinc-200);
		--ring: var(--color-indigo-500);
	}

	@apply *:text-foreground;
}`
				});

				$$renderer.push(`<!----></section> <section>`);

				H2($$renderer, {
					id: 'apply-theme',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Apply Theme`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Paragraph($$renderer, {
					class: 'mt-1 mb-6 text-muted-foreground',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Ensure your root body includes <code>theme-container</code> so the selected Mist theme is
			applied across the application.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				DocsCodeBlock($$renderer, {
					fileName: 'src/app.html',
					lang: "html",
					code: `<body data-theme="mist" class="theme-container">
	<!-- Your Application -->
</body>`
				});

				$$renderer.push(`<!----></section> <section>`);

				H2($$renderer, {
					id: 'required-components',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Required Components`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Paragraph($$renderer, {
					class: 'mt-1 mb-6 text-muted-foreground',
					children: ($$renderer) => {
						$$renderer.push(`<!---->After theme tokens are configured, update these Mist primitives in your app.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Table($$renderer, {
					wrapperClass: 'mt-2 mb-6',
					class: 'text-sm [&_code]:text-[0.7rem] [&_td]:px-3 [&_td]:py-2.5 [&_th]:h-11 [&_th]:px-3',
					children: ($$renderer) => {
						Thead($$renderer, {
							children: ($$renderer) => {
								Tr($$renderer, {
									children: ($$renderer) => {
										Th($$renderer, {
											class: 'border-r',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Component`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Th($$renderer, {
											class: 'border-r',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Import Path`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Th($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Update Scope`);
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

						$$renderer.push(`<!----> `);

						Tbody($$renderer, {
							children: ($$renderer) => {
								Tr($$renderer, {
									children: ($$renderer) => {
										Td($$renderer, {
											class: 'border-r',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Button`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Td($$renderer, {
											class: 'border-r font-mono text-xs',
											children: ($$renderer) => {
												$$renderer.push(`<!---->$lib/components/ui/mist/button`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Td($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Variant and size classes, anchor/button rendering`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Tr($$renderer, {
									children: ($$renderer) => {
										Td($$renderer, {
											class: 'border-r',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Card`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Td($$renderer, {
											class: 'border-r font-mono text-xs',
											children: ($$renderer) => {
												$$renderer.push(`<!---->$lib/components/ui/mist/card`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Td($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Root variants and all card composition primitives`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></section> <section>`);

				H2($$renderer, {
					id: 'button-component',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Button Component`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Paragraph($$renderer, {
					class: 'mt-1 mb-6',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Mist button adds a <code>neutral</code> variant for bold monochrome actions while keeping
			the standard shadcn-like variants.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				H3($$renderer, {
					id: 'button-usage',
					class: 'mb-2',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Usage`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				DocsCodeBlock($$renderer, {
					fileName: 'button-usage.svelte',
					lang: 'svelte',
					code: `\<\script lang="ts"\>
	import { Button } from "$lib/components/ui/mist/button";
\<\/script\>

<Button variant="neutral">Neutral Button</Button>`
				});

				$$renderer.push(`<!----> `);

				H3($$renderer, {
					id: 'button-source',
					class: 'mb-2',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Source`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				MultipleCode($$renderer, { code: buttonSourceCode });
				$$renderer.push(`<!----></section> <section>`);

				H2($$renderer, {
					id: 'card-component',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Card Component`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Paragraph($$renderer, {
					class: 'mt-1 mb-6',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Mist card adds <code>soft</code> and <code>mixed</code> variants to support subtle sections
			commonly used across documentation-style layouts.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				H3($$renderer, {
					id: 'card-usage',
					class: 'mb-2',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Usage`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				DocsCodeBlock($$renderer, {
					fileName: 'card-usage.svelte',
					lang: 'svelte',
					code: `\<\script lang="ts"\>
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/mist/card";
\<\/script\>

<Card variant="soft">
	<CardHeader>
		<CardTitle>Soft Card</CardTitle>
	</CardHeader>
	<CardContent>...</CardContent>
</Card>

<Card variant="mixed">
	<CardHeader>
		<CardTitle>Mixed Card</CardTitle>
	</CardHeader>
	<CardContent>...</CardContent>
</Card>`
				});

				$$renderer.push(`<!----> `);

				H3($$renderer, {
					id: 'card-source',
					class: 'mb-2',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Source`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				MultipleCode($$renderer, { code: cardSourceCode });
				$$renderer.push(`<!----></section>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}