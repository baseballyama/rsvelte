<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import StarIcon from '@lucide/svelte/icons/star';
</script>

<Button>
	<StarIcon class="-ms-1 opacity-60" size={16} aria-hidden="true" />
	<span class="flex items-baseline gap-2">
		Star
		<span class="text-primary-foreground/60 text-xs">729</span>
	</span>
</Button>
