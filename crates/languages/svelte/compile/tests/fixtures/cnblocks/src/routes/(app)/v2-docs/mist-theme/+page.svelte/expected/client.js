import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SEOComponent from "$lib/seo/SEO.svelte";
import DocsPageShell from "$lib/components/layout/DocsPageShell.svelte";
import MultipleCode from "$lib/components/ui/code/multiple-code.svelte";
import { H2, H3, Paragraph, Table, Thead, Tbody, Tr, Th, Td } from "$lib/components/markdown/index";
import { docsV2PageMap } from "$lib/config/docs-v2";
import DocsCodeBlock from "$lib/web/docs/DocsCodeBlock.svelte";

var root = $.from_html(
	`Add the Mist theme variables to your global stylesheet <code class="rounded-sm bg-secondary px-1">app.css</code> or <code class="rounded-sm bg-secondary px-1">layout.css</code> so Mist primitives resolve
			color, border, and contrast consistently.`,
	1
);

var root_1 = $.from_html(
	`Ensure your root body includes <code>theme-container</code> so the selected Mist theme is
			applied across the application.`,
	1
);

var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

var root_4 = $.from_html(
	`Mist button adds a <code>neutral</code> variant for bold monochrome actions while keeping
			the standard shadcn-like variants.`,
	1
);

var root_5 = $.from_html(
	`Mist card adds <code>soft</code> and <code>mixed</code> variants to support subtle sections
			commonly used across documentation-style layouts.`,
	1
);

var root_6 = $.from_html(`<section><!> <!> <!></section> <section><!> <!> <!></section> <section><!> <!> <!></section> <section><!> <!> <!> <!> <!> <!></section> <section><!> <!> <!> <!> <!> <!></section>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

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

	var fragment = root_3();
	var node = $.first_child(fragment);

	SEOComponent(node, {
		get title() {
			return pageMeta.seo.title;
		},

		get description() {
			return pageMeta.seo.description;
		},

		get keywords() {
			return pageMeta.seo.keywords;
		}
	});

	var node_1 = $.sibling(node, 2);

	DocsPageShell(node_1, {
		title: 'Mist Theme Setup',
		description: 'Apply Mist theme tokens and update button and card primitives for documentation-style UI styling.',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_6();
			var section = $.first_child(fragment_1);
			var node_2 = $.child(section);

			H2(node_2, {
				id: 'theme-quickstart',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Theme Quickstart');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Paragraph(node_3, {
				class: 'mt-1 mb-6 text-muted-foreground',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root();

					$.next(4);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			DocsCodeBlock(node_4, {
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

			$.reset(section);

			var section_1 = $.sibling(section, 2);
			var node_5 = $.child(section_1);

			H2(node_5, {
				id: 'apply-theme',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Apply Theme');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Paragraph(node_6, {
				class: 'mt-1 mb-6 text-muted-foreground',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_3 = root_1();

					$.next(2);
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			DocsCodeBlock(node_7, {
				fileName: 'src/app.html',
				lang: "html",
				code: `<body data-theme="mist" class="theme-container">
	<!-- Your Application -->
</body>`
			});

			$.reset(section_1);

			var section_2 = $.sibling(section_1, 2);
			var node_8 = $.child(section_2);

			H2(node_8, {
				id: 'required-components',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Required Components');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			Paragraph(node_9, {
				class: 'mt-1 mb-6 text-muted-foreground',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('After theme tokens are configured, update these Mist primitives in your app.');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			Table(node_10, {
				wrapperClass: 'mt-2 mb-6',
				class: 'text-sm [&_code]:text-[0.7rem] [&_td]:px-3 [&_td]:py-2.5 [&_th]:h-11 [&_th]:px-3',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_3();
					var node_11 = $.first_child(fragment_4);

					Thead(node_11, {
						children: ($$anchor, $$slotProps) => {
							Tr($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_2();
									var node_12 = $.first_child(fragment_6);

									Th(node_12, {
										class: 'border-r',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Component');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});

									var node_13 = $.sibling(node_12, 2);

									Th(node_13, {
										class: 'border-r',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('Import Path');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});

									var node_14 = $.sibling(node_13, 2);

									Th(node_14, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('Update Scope');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_15 = $.sibling(node_11, 2);

					Tbody(node_15, {
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_3();
							var node_16 = $.first_child(fragment_7);

							Tr(node_16, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_2();
									var node_17 = $.first_child(fragment_8);

									Td(node_17, {
										class: 'border-r',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text('Button');

											$.append($$anchor, text_7);
										},
										$$slots: { default: true }
									});

									var node_18 = $.sibling(node_17, 2);

									Td(node_18, {
										class: 'border-r font-mono text-xs',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_8 = $.text('$lib/components/ui/mist/button');

											$.append($$anchor, text_8);
										},
										$$slots: { default: true }
									});

									var node_19 = $.sibling(node_18, 2);

									Td(node_19, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_9 = $.text('Variant and size classes, anchor/button rendering');

											$.append($$anchor, text_9);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});

							var node_20 = $.sibling(node_16, 2);

							Tr(node_20, {
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_2();
									var node_21 = $.first_child(fragment_9);

									Td(node_21, {
										class: 'border-r',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_10 = $.text('Card');

											$.append($$anchor, text_10);
										},
										$$slots: { default: true }
									});

									var node_22 = $.sibling(node_21, 2);

									Td(node_22, {
										class: 'border-r font-mono text-xs',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_11 = $.text('$lib/components/ui/mist/card');

											$.append($$anchor, text_11);
										},
										$$slots: { default: true }
									});

									var node_23 = $.sibling(node_22, 2);

									Td(node_23, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_12 = $.text('Root variants and all card composition primitives');

											$.append($$anchor, text_12);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.reset(section_2);

			var section_3 = $.sibling(section_2, 2);
			var node_24 = $.child(section_3);

			H2(node_24, {
				id: 'button-component',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_13 = $.text('Button Component');

					$.append($$anchor, text_13);
				},
				$$slots: { default: true }
			});

			var node_25 = $.sibling(node_24, 2);

			Paragraph(node_25, {
				class: 'mt-1 mb-6',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_10 = root_4();

					$.next(2);
					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});

			var node_26 = $.sibling(node_25, 2);

			H3(node_26, {
				id: 'button-usage',
				class: 'mb-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_14 = $.text('Usage');

					$.append($$anchor, text_14);
				},
				$$slots: { default: true }
			});

			var node_27 = $.sibling(node_26, 2);

			DocsCodeBlock(node_27, {
				fileName: 'button-usage.svelte',
				lang: 'svelte',
				code: `\<\script lang="ts"\>
	import { Button } from "$lib/components/ui/mist/button";
\<\/script\>

<Button variant="neutral">Neutral Button</Button>`
			});

			var node_28 = $.sibling(node_27, 2);

			H3(node_28, {
				id: 'button-source',
				class: 'mb-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_15 = $.text('Source');

					$.append($$anchor, text_15);
				},
				$$slots: { default: true }
			});

			var node_29 = $.sibling(node_28, 2);

			MultipleCode(node_29, {
				get code() {
					return buttonSourceCode;
				}
			});

			$.reset(section_3);

			var section_4 = $.sibling(section_3, 2);
			var node_30 = $.child(section_4);

			H2(node_30, {
				id: 'card-component',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_16 = $.text('Card Component');

					$.append($$anchor, text_16);
				},
				$$slots: { default: true }
			});

			var node_31 = $.sibling(node_30, 2);

			Paragraph(node_31, {
				class: 'mt-1 mb-6',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_11 = root_5();

					$.next(4);
					$.append($$anchor, fragment_11);
				},
				$$slots: { default: true }
			});

			var node_32 = $.sibling(node_31, 2);

			H3(node_32, {
				id: 'card-usage',
				class: 'mb-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_17 = $.text('Usage');

					$.append($$anchor, text_17);
				},
				$$slots: { default: true }
			});

			var node_33 = $.sibling(node_32, 2);

			DocsCodeBlock(node_33, {
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

			var node_34 = $.sibling(node_33, 2);

			H3(node_34, {
				id: 'card-source',
				class: 'mb-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_18 = $.text('Source');

					$.append($$anchor, text_18);
				},
				$$slots: { default: true }
			});

			var node_35 = $.sibling(node_34, 2);

			MultipleCode(node_35, {
				get code() {
					return cardSourceCode;
				}
			});

			$.reset(section_4);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}