<script lang="ts">
	import { badgeVariants } from '$lib/components/ui/badge.svelte';

	import { cn } from '$lib/utils';
</script>

<a href="#title" class={cn(badgeVariants({ variant: 'default' }), 'hover:bg-primary/80')}> Link </a>
