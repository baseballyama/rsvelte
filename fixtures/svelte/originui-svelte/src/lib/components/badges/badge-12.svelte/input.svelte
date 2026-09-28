<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';

	import X from '@lucide/svelte/icons/x';

	let isActive = $state(true);
</script>

{#if isActive}
	<Badge>
		Removable
		<button
			class="focus-visible:outline-ring/70 -my-px -ms-px -me-1.5 inline-flex size-5 shrink-0 items-center justify-center rounded-[inherit] p-0 opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-solid"
			onclick={() => (isActive = false)}
		>
			<X size={12} aria-hidden="true" />
		</button>
	</Badge>
{/if}
