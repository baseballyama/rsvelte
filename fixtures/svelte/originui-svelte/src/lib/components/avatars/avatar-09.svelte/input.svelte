<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';

	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
</script>

<div class="relative">
	<Avatar>
		<AvatarImage src="/avatar-80-07.jpg" alt="Kelly King" />
		<AvatarFallback>KK</AvatarFallback>
	</Avatar>
	<Badge class="border-background absolute -top-1.5 left-full min-w-5 -translate-x-3.5 px-1"
		>6</Badge
	>
</div>
