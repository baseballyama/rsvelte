<script lang="ts">
	import { badgeVariants } from '$lib/components/ui/badge.svelte';
	import Checkbox from '$lib/components/ui/checkbox.svelte';

	import Check from '@lucide/svelte/icons/check';
	import { cn } from '$lib/utils';
</script>

<label
	class={cn(
		badgeVariants({ variant: 'default' }),
		'hover:bg-primary/80 has-data-[state=unchecked]:bg-muted has-data-[state=unchecked]:text-muted-foreground has-focus-visible:outline-ring/70 cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-solid'
	)}
>
	<div class="flex items-center gap-1">
		<Checkbox id="badge-selectable" class="peer sr-only after:absolute after:inset-0" checked />
		<Check size={12} class="hidden peer-data-[state=checked]:block" aria-hidden="true" />
		<span class="select-none">Selectable</span>
	</div>
</label>
