<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import AvatarImg01 from '$assets/avatar-80-03.jpg?w=80&h=80&enhanced';
	import AvatarImg02 from '$assets/avatar-80-05.jpg?w=80&h=80&enhanced';
	import AvatarImg03 from '$assets/avatar-80-06.jpg?w=80&h=80&enhanced';
	import AvatarImg04 from '$assets/avatar-80-07.jpg?w=80&h=80&enhanced';
</script>

<div
	class="border-border bg-background flex items-center rounded-full border p-1 shadow-sm shadow-black/5"
>
	<div class="flex -space-x-3">
		<enhanced:img
			class="ring-background size-10 rounded-full ring-2"
			src={AvatarImg01}
			alt="Avatar 01"
			loading="lazy"
			decoding="async"
		/>
		<enhanced:img
			class="ring-background size-10 rounded-full ring-2"
			src={AvatarImg02}
			alt="Avatar 02"
			loading="lazy"
			decoding="async"
		/>
		<enhanced:img
			class="ring-background size-10 rounded-full ring-2"
			src={AvatarImg03}
			alt="Avatar 03"
			loading="lazy"
			decoding="async"
		/>
		<enhanced:img
			class="ring-background size-10 rounded-full ring-2"
			src={AvatarImg04}
			alt="Avatar 04"
			loading="lazy"
			decoding="async"
		/>
	</div>
	<Button
		variant="secondary"
		class="text-muted-foreground hover:text-foreground flex items-center justify-center rounded-full bg-transparent px-3 text-xs shadow-none hover:bg-transparent"
	>
		+3
	</Button>
</div>
