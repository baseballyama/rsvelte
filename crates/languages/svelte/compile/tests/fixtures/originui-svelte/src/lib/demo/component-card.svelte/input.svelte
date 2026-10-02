<script lang="ts">
	import type { WithElementRef, WithoutChildren } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils';

	type Layout = 'default' | 'full' | 'wide';
	type Style = 'centered' | 'default' | 'text-center';

	interface ComponentMeta {
		layout?: Layout;
		overflow?: boolean;
		style?: Style;
	}

	type Props = WithElementRef<
		WithoutChildren<HTMLAttributes<HTMLDivElement>> & {
			children: Snippet;
			meta?: ComponentMeta;
		},
		HTMLDivElement
	>;

	let { children, class: className, meta, ref = $bindable(), ...rest }: Props = $props();

	const layoutClasses = $derived.by(() => {
		switch (meta?.layout) {
			case 'full':
				return 'col-span-12';
			case 'wide':
				return 'col-span-12 sm:col-span-6 lg:col-span-6';
			default:
				return 'col-span-12 sm:col-span-6 lg:col-span-4';
		}
	});

	const styleClasses = $derived.by(() => {
		switch (meta?.style) {
			case 'centered':
				return 'flex items-center justify-center';
			case 'text-center':
				return 'text-center';
			default:
				return '';
		}
	});

	const overflowClasses = $derived.by(() => {
		return meta?.overflow ? 'overflow-auto' : '';
	});
</script>

<div
	bind:this={ref}
	class={cn('group/item relative border', layoutClasses, styleClasses, overflowClasses, className)}
	{...rest}
>
	{@render children()}
</div>

<style>
	div::-webkit-scrollbar {
		width: 5px;
	}

	div::-webkit-scrollbar-thumb {
		background: hsl(var(--border));
		border-radius: 5px;
	}
	div {
		scrollbar-width: thin;
		scrollbar-color: hsl(var(--border)) transparent;
	}
</style>
