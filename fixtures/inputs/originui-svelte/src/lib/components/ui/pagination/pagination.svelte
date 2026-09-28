<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import type { SvelteHTMLElements } from 'svelte/elements';

	import { cn } from '$lib/utils.js';

	type Props = WithElementRef<SvelteHTMLElements['nav']> & {
		children: Snippet;
	};

	let { children, class: className, ref = $bindable(null), ...restProps }: Props = $props();
</script>

<nav
	aria-label="pagination"
	class={cn('mx-auto flex w-full justify-center', className)}
	{...restProps}
>
	{@render children()}
</nav>
