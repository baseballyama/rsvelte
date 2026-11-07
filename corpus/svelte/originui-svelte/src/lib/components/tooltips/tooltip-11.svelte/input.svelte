<script lang="ts">
	import FriendImg01 from '$assets/avatar-20-04.jpg?w=20&h=20&enhanced';
	import FriendImg02 from '$assets/avatar-20-05.jpg?w=20&h=20&enhanced';
	import FriendImg03 from '$assets/avatar-20-06.jpg?w=20&h=20&enhanced';
	import AvatarImg from '$assets/avatar-40-05.jpg?w=40&h=40&enhanced';
	import { HoverCard, HoverCardContent, HoverCardTrigger } from '$lib/components/ui/hover-card';
</script>

<HoverCard>
	<div class="flex items-center gap-3">
		<enhanced:img class="shrink-0 rounded-full" src={AvatarImg} alt="Avatar" />
		<div class="space-y-0.5">
			<HoverCardTrigger>
				{#snippet child({ props })}
					<a class="text-sm font-medium hover:underline" href="#title" {...props}>
						Keith Kennedy
					</a>
				{/snippet}
			</HoverCardTrigger>
			<p class="text-muted-foreground text-xs">@k.kennedy</p>
		</div>
	</div>
	<HoverCardContent>
		<div class="space-y-3">
			<div class="flex items-center gap-3">
				<enhanced:img class="shrink-0 rounded-full" src={AvatarImg} alt="Avatar" />
				<div class="space-y-0.5">
					<p class="text-sm font-medium">Keith Kennedy</p>
					<p class="text-muted-foreground text-xs">@k.kennedy</p>
				</div>
			</div>
			<p class="text-muted-foreground text-sm">
				Designer at <strong class="text-foreground font-medium">@Origin UI - Svelte</strong>.
				Crafting web experiences with Tailwind CSS.
			</p>
			<div class="flex items-center gap-2">
				<div class="flex -space-x-1.5">
					<enhanced:img
						class="ring-background rounded-full ring-1"
						src={FriendImg01}
						alt="Friend 01"
					/>
					<enhanced:img
						class="ring-background rounded-full ring-1"
						src={FriendImg02}
						alt="Friend 02"
					/>
					<enhanced:img
						class="ring-background rounded-full ring-1"
						src={FriendImg03}
						alt="Friend 03"
					/>
				</div>
				<div class="text-muted-foreground text-xs">3 mutual friends</div>
			</div>
		</div>
	</HoverCardContent>
</HoverCard>
