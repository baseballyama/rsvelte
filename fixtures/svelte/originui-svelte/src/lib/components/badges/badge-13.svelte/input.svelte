<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';

	import X from '@lucide/svelte/icons/x';

	let isActive = $state(true);
</script>

{#if isActive}
	<Badge variant="outline" class="rounded-md px-2 py-1">
		Tag
		<button
			class="focus-visible:outline-ring/70 -my-[5px] -ms-0.5 -me-2 inline-flex size-7 shrink-0 items-center justify-center rounded-[inherit] p-0 opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-solid"
			onclick={() => (isActive = false)}
			aria-label="Delete"
		>
			<X size={14} aria-hidden="true" />
		</button>
	</Badge>
{/if}
