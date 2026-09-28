<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import AvatarImg01 from '$assets/avatar-80-03.jpg?w=80&h=80&enhanced';
	import AvatarImg02 from '$assets/avatar-80-05.jpg?w=80&h=80&enhanced';
	import AvatarImg03 from '$assets/avatar-80-06.jpg?w=80&h=80&enhanced';
	import AvatarImg04 from '$assets/avatar-80-07.jpg?w=80&h=80&enhanced';
</script>

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
	<Button
		variant="secondary"
		class="bg-secondary text-muted-foreground ring-background hover:bg-secondary hover:text-foreground flex size-10 items-center justify-center rounded-full text-xs ring-2"
		size="icon"
	>
		+3
	</Button>
</div>
