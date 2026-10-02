import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SEOComponent from "$lib/seo/SEO.svelte";
import DocsPageShell from "$lib/components/layout/DocsPageShell.svelte";
import MultipleCode from "$lib/components/ui/code/multiple-code.svelte";
import { H2, H3, Paragraph, Link, Table, Thead, Tbody, Tr, Th, Td } from "$lib/components/markdown/index";
import { docsV2PageMap } from "$lib/config/docs-v2";
import DocsCodeBlock from "$lib/web/docs/DocsCodeBlock.svelte";

var root = $.from_html(
	`Add the Veil tokens to your global stylesheet <code class="rounded-sm bg-secondary px-1">app.css</code> or <code class="rounded-sm bg-secondary px-1">layout.css</code> so all Veil primitives resolve
			color, border, focus ring, and typography consistently.`,
	1
);

var root_1 = $.from_html(`Gesit Font : <!>`, 1);
var root_2 = $.from_html(`Asar Font : <!>`, 1);

var root_3 = $.from_html(
	`Ensure your root body includes <code>theme-container</code> so the selected theme scope is
			applied across the application.`,
	1
);

var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <!>`, 1);

var root_7 = $.from_html(
	`Veil card supports four variants: <code>default</code>, <code>soft</code>, <code>mixed</code>, and <code>outline</code>, with composition primitives for
			header/content/footer layouts.`,
	1
);

var root_8 = $.from_html(`<section><!> <!> <!> <!> <!> <!></section> <section><!> <!> <!></section> <section><!> <!> <!></section> <section><!> <!> <!> <!> <!> <!></section> <section><!> <!> <!> <div><!></div> <!> <!></section> <section><!> <!> <!> <!> <!> <!></section> <section><!> <!> <!> <div><!></div> <!> <!></section>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const pageMeta = docsV2PageMap.veilTheme;

	const buttonSourceCode = [
		{
			filename: "button.svelte",
			lang: "svelte",
			filecode: `\<\script lang="ts" module\>
	import type { WithElementRef } from "bits-ui";
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
	import { type VariantProps, tv } from "tailwind-variants";

	export const buttonVariants = tv({
		base: "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-medium whitespace-nowrap duration-200 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none active:scale-99 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
		variants: {
			variant: {
				default: "bg-foreground text-background hover:brightness-95",
				neutral: "bg-foreground text-background hover:brightness-95",
				destructive:
					"text-destructive-foreground bg-destructive shadow-md hover:bg-destructive/90",
				outline:
					"border border-transparent bg-card text-foreground shadow-sm ring-1 shadow-black/6.5 ring-foreground/15 duration-200 hover:bg-muted/50",
				secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
				ghost: "text-foreground/75 hover:bg-foreground/5 hover:text-foreground",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-8 px-3 py-2",
				sm: "h-7 px-2.5 text-sm",
				lg: "h-11 px-6 text-base font-medium",
				icon: "size-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
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
			filecode: `import Button from "./button.svelte";

export { Button };`
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
		base: "rounded-2xl text-card-foreground",
		variants: {
			variant: {
				default:
					"bg-card shadow-lg ring-1 shadow-foreground/5 ring-foreground/6.5 dark:shadow-black/10",
				soft: "bg-muted",
				mixed: "border bg-muted",
				outline: "bg-card ring-1 ring-border",
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

<!--  pb-0 -->
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
	class={cn("leading-none font-semibold tracking-tight", className)}
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

<p bind:this={ref} class={cn("text-sm text-muted-foreground", className)} {...restProps}>
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

<div bind:this={ref} class={cn("flex items-center p-6 pt-0", className)} {...restProps}>
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

	const inputSourceCode = [
		{
			filename: "input.svelte",
			lang: "svelte",
			filecode: `\<\script lang="ts"\>
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from "svelte/elements";
	import type { WithElementRef } from "bits-ui";
	import { cn } from "$lib/utils.js";

	type InputType = Exclude<HTMLInputTypeAttribute, "file">;

	type Props = WithElementRef<
		Omit<HTMLInputAttributes, "type"> &
			({ type: "file"; files?: FileList } | { type?: InputType; files?: undefined })
	>;

	let {
		ref = $bindable(null),
		value = $bindable(),
		type,
		files = $bindable(),
		class: className,
		...restProps
	}: Props = $props();
\<\/script\>

{#if type === "file"}
	<input
		bind:this={ref}
		class={cn(
			"flex h-8 w-full min-w-0 rounded-md border border-input bg-card px-3 py-1 text-sm outline-none not-dark:bg-card selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
			"focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15",
			"aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
			className
		)}
		type="file"
		bind:files
		bind:value
		{...restProps}
	/>
{:else}
	<input
		bind:this={ref}
		class={cn(
			"flex h-8 w-full min-w-0 rounded-md border border-input bg-card px-3 py-1 text-sm outline-none not-dark:bg-card selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
			"focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15",
			"aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
			className
		)}
		{type}
		bind:value
		{...restProps}
	/>
{/if}`
		},

		{
			filename: "index.ts",
			lang: "typescript",
			filecode: `import Root from "./input.svelte";

export {
	Root,
	//
	Root as Input,
};`
		}
	];

	const textareaSourceCode = [
		{
			filename: "textarea.svelte",
			lang: "svelte",
			filecode: `\<\script lang="ts"\>
	import type { WithElementRef, WithoutChildren } from "bits-ui";
	import type { HTMLTextareaAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		...restProps
	}: WithoutChildren<WithElementRef<HTMLTextareaAttributes>> = $props();
\<\/script\>

<textarea
	bind:this={ref}
	bind:value
	class={cn(
		"flex field-sizing-content min-h-16 w-full rounded-md border border-input px-3 py-2 text-base transition-colors outline-none not-dark:bg-card placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:ring-destructive/40",
		className
	)}
	{...restProps}
></textarea>`
		},

		{
			filename: "index.ts",
			lang: "typescript",
			filecode: `import Root from "./textarea.svelte";

export {
	Root,
	//
	Root as Textarea,
};`
		}
	];

	var fragment = root_6();
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
		title: 'Veil Theme Setup',
		description: 'Apply Veil theme tokens and update button, card, input, and textarea primitives for consistent UI styling.',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_8();
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
				code: `[data-theme="veil"] .theme-container {
	--radius: 0.625rem;

	--background: oklch(0.9779 0.0042 56.38);
	--foreground: oklch(0.3421 0.0379 61.15);

	--card: var(--color-white);
	--card-foreground: oklch(0.3421 0.0379 61.15);

	--popover: var(--color-white);
	--popover-foreground: oklch(0.3421 0.0379 61.15);

	--primary: oklch(0.5967 0.0558 61.59);
	--primary-foreground: oklch(0.1448 0 0);

	--secondary: --alpha(var(--primary)/15%);
	--secondary-foreground: oklch(0.3421 0.0379 61.15);

	--muted: --alpha(var(--foreground)/5%);
	--muted-foreground: oklch(0.4563 0.0061 48.59);

	--accent: oklch(0.9068 0.0112 89.73);
	--accent-foreground: oklch(0.3467 0.0231 86.12);

	--destructive: var(--color-red-600);
	--destructive-foreground: var(--color-white);

	--border: --alpha(var(--foreground)/7.5%);
	--input: --alpha(var(--foreground)/20%);
	--ring: var(--primary);

	--font-family: "Geist", sans-serif;
	--font-serif: "Asar", serif;

	@variant dark {
		--background: oklch(0.1448 0 0);
		--foreground: oklch(0.9027 0.0137 60.56);

		--card: oklch(0.1924 0.0016 17.3);
		--card-foreground: oklch(0.9027 0.0137 60.56);

		--popover: var(--color-white);
		--popover-foreground: oklch(0.9027 0.0137 60.56);

		--primary-foreground: var(--color-white);
		--secondary: --alpha(var(--primary)/10%);
		--secondary-foreground: oklch(0.9027 0.0137 60.56);

		--muted: var(--background);
		--muted-foreground: oklch(0.7262 0.0037 67.77);

		--accent: var(--color-zinc-700);
		--accent-foreground: var(--color-white);

		--input: --alpha(var(--foreground)/15%);
	}

	@apply *:text-foreground selection:bg-muted selection:text-primary;
}`,
				lang: 'css'
			});

			var node_5 = $.sibling(node_4, 2);

			Paragraph(node_5, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Veil Theme uses Geist, Asar font.');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Paragraph(node_6, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_3 = root_1();
					var node_7 = $.sibling($.first_child(fragment_3));

					Link(node_7, {
						href: 'https://fonts.google.com/specimen/Geist',
						target: '_blank',
						rel: 'noreferrer',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Geist on Google Fonts');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_6, 2);

			Paragraph(node_8, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_4 = root_2();
					var node_9 = $.sibling($.first_child(fragment_4));

					Link(node_9, {
						href: 'https://fonts.google.com/specimen/Asar',
						target: '_blank',
						rel: 'noreferrer',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Asar on Google Fonts');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.reset(section);

			var section_1 = $.sibling(section, 2);
			var node_10 = $.child(section_1);

			H2(node_10, {
				id: 'apply-theme',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Apply Theme');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			Paragraph(node_11, {
				class: 'mt-1 mb-4 text-muted-foreground',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_5 = root_3();

					$.next(2);
					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_11, 2);

			DocsCodeBlock(node_12, {
				fileName: 'src/app.html',
				code: `<body data-theme="veil" class="theme-container">
	<!-- Your Application -->
</body>`,
				lang: 'html'
			});

			$.reset(section_1);

			var section_2 = $.sibling(section_1, 2);
			var node_13 = $.child(section_2);

			H2(node_13, {
				id: 'required-components',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Required Components');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_13, 2);

			Paragraph(node_14, {
				class: 'mt-1 mb-4 text-muted-foreground',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('After theme tokens are configured, update these four Veil primitives in your app.');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var node_15 = $.sibling(node_14, 2);

			Table(node_15, {
				wrapperClass: 'mt-2 mb-6',
				class: 'text-sm [&_code]:text-[0.7rem] [&_td]:px-3 [&_td]:py-2.5  [&_th]:h-11 [&_th]:px-3 ',
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_6();
					var node_16 = $.first_child(fragment_6);

					Thead(node_16, {
						children: ($$anchor, $$slotProps) => {
							Tr($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_4();
									var node_17 = $.first_child(fragment_8);

									Th(node_17, {
										class: 'border-r',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text('Component');

											$.append($$anchor, text_7);
										},
										$$slots: { default: true }
									});

									var node_18 = $.sibling(node_17, 2);

									Th(node_18, {
										class: 'border-r',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_8 = $.text('Import Path');

											$.append($$anchor, text_8);
										},
										$$slots: { default: true }
									});

									var node_19 = $.sibling(node_18, 2);

									Th(node_19, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_9 = $.text('Update Scope');

											$.append($$anchor, text_9);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_20 = $.sibling(node_16, 2);

					Tbody(node_20, {
						children: ($$anchor, $$slotProps) => {
							var fragment_9 = root_5();
							var node_21 = $.first_child(fragment_9);

							Tr(node_21, {
								class: '',
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root_4();
									var node_22 = $.first_child(fragment_10);

									Td(node_22, {
										class: 'border-r',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_10 = $.text('Button');

											$.append($$anchor, text_10);
										},
										$$slots: { default: true }
									});

									var node_23 = $.sibling(node_22, 2);

									Td(node_23, {
										class: 'border-r font-mono text-xs',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_11 = $.text('$lib/components/ui/veil/button');

											$.append($$anchor, text_11);
										},
										$$slots: { default: true }
									});

									var node_24 = $.sibling(node_23, 2);

									Td(node_24, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_12 = $.text('Variant and size classes, anchor/button rendering');

											$.append($$anchor, text_12);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});

							var node_25 = $.sibling(node_21, 2);

							Tr(node_25, {
								class: '',
								children: ($$anchor, $$slotProps) => {
									var fragment_11 = root_4();
									var node_26 = $.first_child(fragment_11);

									Td(node_26, {
										class: 'border-r',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_13 = $.text('Card');

											$.append($$anchor, text_13);
										},
										$$slots: { default: true }
									});

									var node_27 = $.sibling(node_26, 2);

									Td(node_27, {
										class: 'border-r font-mono text-xs',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_14 = $.text('$lib/components/ui/veil/card');

											$.append($$anchor, text_14);
										},
										$$slots: { default: true }
									});

									var node_28 = $.sibling(node_27, 2);

									Td(node_28, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_15 = $.text('Root variants and all card composition primitives');

											$.append($$anchor, text_15);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_11);
								},
								$$slots: { default: true }
							});

							var node_29 = $.sibling(node_25, 2);

							Tr(node_29, {
								class: '',
								children: ($$anchor, $$slotProps) => {
									var fragment_12 = root_4();
									var node_30 = $.first_child(fragment_12);

									Td(node_30, {
										class: 'border-r',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_16 = $.text('Input');

											$.append($$anchor, text_16);
										},
										$$slots: { default: true }
									});

									var node_31 = $.sibling(node_30, 2);

									Td(node_31, {
										class: 'border-r font-mono text-xs',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_17 = $.text('$lib/components/ui/veil/input');

											$.append($$anchor, text_17);
										},
										$$slots: { default: true }
									});

									var node_32 = $.sibling(node_31, 2);

									Td(node_32, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_18 = $.text('Field styling, file input branch, focus/error states');

											$.append($$anchor, text_18);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_12);
								},
								$$slots: { default: true }
							});

							var node_33 = $.sibling(node_29, 2);

							Tr(node_33, {
								class: '',
								children: ($$anchor, $$slotProps) => {
									var fragment_13 = root_4();
									var node_34 = $.first_child(fragment_13);

									Td(node_34, {
										class: 'border-r',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_19 = $.text('Textarea');

											$.append($$anchor, text_19);
										},
										$$slots: { default: true }
									});

									var node_35 = $.sibling(node_34, 2);

									Td(node_35, {
										class: 'border-r font-mono text-xs',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_20 = $.text('$lib/components/ui/veil/textarea');

											$.append($$anchor, text_20);
										},
										$$slots: { default: true }
									});

									var node_36 = $.sibling(node_35, 2);

									Td(node_36, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_21 = $.text('Multiline field sizing, focus/error/disabled states');

											$.append($$anchor, text_21);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_13);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_9);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			$.reset(section_2);

			var section_3 = $.sibling(section_2, 2);
			var node_37 = $.child(section_3);

			H2(node_37, {
				id: 'button-component',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_22 = $.text('Button Component');

					$.append($$anchor, text_22);
				},
				$$slots: { default: true }
			});

			var node_38 = $.sibling(node_37, 2);

			Paragraph(node_38, {
				class: 'mt-1 mb-4 text-muted-foreground',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_23 = $.text('Veil button uses rounded-full geometry, compact sizing, and contrast-aware variants.');

					$.append($$anchor, text_23);
				},
				$$slots: { default: true }
			});

			var node_39 = $.sibling(node_38, 2);

			H3(node_39, {
				id: 'button-usage',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_24 = $.text('Usage');

					$.append($$anchor, text_24);
				},
				$$slots: { default: true }
			});

			var node_40 = $.sibling(node_39, 2);

			DocsCodeBlock(node_40, {
				fileName: 'button-usage.svelte',
				code: `\<\script lang="ts"\>
	import { Button } from "$lib/components/ui/veil/button";
\<\/script\>

<Button variant="default">Default Button</Button>
<Button variant="outline">Outline Button</Button>
<Button size="lg">Large Button</Button>`,
				lang: 'svelte'
			});

			var node_41 = $.sibling(node_40, 2);

			H3(node_41, {
				id: 'button-source',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_25 = $.text('Source');

					$.append($$anchor, text_25);
				},
				$$slots: { default: true }
			});

			var node_42 = $.sibling(node_41, 2);

			MultipleCode(node_42, {
				get code() {
					return buttonSourceCode;
				}
			});

			$.reset(section_3);

			var section_4 = $.sibling(section_3, 2);
			var node_43 = $.child(section_4);

			H2(node_43, {
				id: 'card-component',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_26 = $.text('Card Component');

					$.append($$anchor, text_26);
				},
				$$slots: { default: true }
			});

			var node_44 = $.sibling(node_43, 2);

			Paragraph(node_44, {
				class: 'mt-1 mb-4 text-muted-foreground',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_14 = root_7();

					$.next(8);
					$.append($$anchor, fragment_14);
				},
				$$slots: { default: true }
			});

			var node_45 = $.sibling(node_44, 2);

			H3(node_45, {
				id: 'card-usage',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_27 = $.text('Usage');

					$.append($$anchor, text_27);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node_45, 2);
			var node_46 = $.child(div);

			DocsCodeBlock(node_46, {
				fileName: 'card-usage.svelte',
				code: `\<\script lang="ts"\>
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/veil/card";
\<\/script\>

<Card variant="default">
	<CardHeader>
		<CardTitle>Default Card</CardTitle>
	</CardHeader>
	<CardContent>...</CardContent>
</Card>

<Card variant="outline">
	<CardHeader>
		<CardTitle>Outline Card</CardTitle>
	</CardHeader>
	<CardContent>...</CardContent>
</Card>`,
				lang: 'svelte'
			});

			$.reset(div);

			var node_47 = $.sibling(div, 2);

			H3(node_47, {
				id: 'card-source',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_28 = $.text('Source');

					$.append($$anchor, text_28);
				},
				$$slots: { default: true }
			});

			var node_48 = $.sibling(node_47, 2);

			MultipleCode(node_48, {
				get code() {
					return cardSourceCode;
				}
			});

			$.reset(section_4);

			var section_5 = $.sibling(section_4, 2);
			var node_49 = $.child(section_5);

			H2(node_49, {
				id: 'input-component',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_29 = $.text('Input Component');

					$.append($$anchor, text_29);
				},
				$$slots: { default: true }
			});

			var node_50 = $.sibling(node_49, 2);

			Paragraph(node_50, {
				class: 'mt-1 mb-4 text-muted-foreground',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_30 = $.text('Veil input covers standard and file fields while preserving unified focus and invalid\n			states.');

					$.append($$anchor, text_30);
				},
				$$slots: { default: true }
			});

			var node_51 = $.sibling(node_50, 2);

			H3(node_51, {
				id: 'input-usage',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_31 = $.text('Usage');

					$.append($$anchor, text_31);
				},
				$$slots: { default: true }
			});

			var node_52 = $.sibling(node_51, 2);

			DocsCodeBlock(node_52, {
				fileName: 'input-usage.svelte',
				code: `\<\script lang="ts"\>
	import { Input } from "$lib/components/ui/veil/input";
\<\/script\>

<Input type="email" placeholder="you@example.com" />
<Input aria-invalid="true" placeholder="Invalid state" />
<Input type="file" />`,
				lang: 'svelte'
			});

			var node_53 = $.sibling(node_52, 2);

			H3(node_53, {
				id: 'input-source',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_32 = $.text('Source');

					$.append($$anchor, text_32);
				},
				$$slots: { default: true }
			});

			var node_54 = $.sibling(node_53, 2);

			MultipleCode(node_54, {
				get code() {
					return inputSourceCode;
				}
			});

			$.reset(section_5);

			var section_6 = $.sibling(section_5, 2);
			var node_55 = $.child(section_6);

			H2(node_55, {
				id: 'textarea-component',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_33 = $.text('Textarea Component');

					$.append($$anchor, text_33);
				},
				$$slots: { default: true }
			});

			var node_56 = $.sibling(node_55, 2);

			Paragraph(node_56, {
				class: 'mt-1 mb-4 text-muted-foreground',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_34 = $.text('Veil textarea shares input tokens, adds multiline sizing, and keeps focus/validation\n			states aligned with other form controls.');

					$.append($$anchor, text_34);
				},
				$$slots: { default: true }
			});

			var node_57 = $.sibling(node_56, 2);

			H3(node_57, {
				id: 'textarea-usage',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_35 = $.text('Usage');

					$.append($$anchor, text_35);
				},
				$$slots: { default: true }
			});

			var div_1 = $.sibling(node_57, 2);
			var node_58 = $.child(div_1);

			DocsCodeBlock(node_58, {
				fileName: 'textarea-usage.svelte',
				code: `\<\script lang="ts"\>
	import { Textarea } from "$lib/components/ui/veil/textarea";
\<\/script\>

<Textarea placeholder="Enter details..." />
<Textarea aria-invalid="true" placeholder="Invalid state" />`,
				lang: 'svelte'
			});

			$.reset(div_1);

			var node_59 = $.sibling(div_1, 2);

			H3(node_59, {
				id: 'textarea-source',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_36 = $.text('Source');

					$.append($$anchor, text_36);
				},
				$$slots: { default: true }
			});

			var node_60 = $.sibling(node_59, 2);

			MultipleCode(node_60, {
				get code() {
					return textareaSourceCode;
				}
			});

			$.reset(section_6);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}