<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	import Button from '$lib/components/ui/button.svelte';
	import { cn } from '$lib/utils.js';

	import IconGithub from '~icons/ri/github-fill';

	let { class: className, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	class={cn('flex h-full flex-col items-center justify-center gap-4 text-center', className)}
	{...restProps}
>
	<div class="space-y-2">
		<p class="text-muted-foreground text-sm">Component not available</p>
		<p class="text-muted-foreground text-xs">Want to contribute and make it happen?</p>
	</div>

	<Button
		variant="outline"
		href="https://github.com/max-got/originui-svelte"
		size="sm"
		class="gap-x-2"
	>
		<IconGithub width="16" height="16" aria-hidden="true" />
		Create this component
	</Button>
</div>
