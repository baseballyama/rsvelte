<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
</script>

<div class="relative">
	<Avatar class="rounded-lg">
		<AvatarImage src="/avatar-80-07.jpg" alt="Kelly King" />
		<AvatarFallback>KK</AvatarFallback>
	</Avatar>
	<span
		class="border-background absolute -end-1 -top-1 size-3 rounded-full border-2 bg-emerald-500"
	>
		<span class="sr-only">Online</span>
	</span>
</div>
