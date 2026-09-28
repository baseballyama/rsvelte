<script lang="ts">
	import ContentImg from '$assets/dialog-content.png?w=382&h=216&enhanced';
	import { HoverCard, HoverCardContent, HoverCardTrigger } from '$lib/components/ui/hover-card';
</script>

<HoverCard>
	<HoverCardTrigger>
		{#snippet child({ props })}
			<a
				class="flex size-16 overflow-hidden rounded-lg p-0"
				aria-label="My profile"
				href="#title"
				{...props}
			>
				<enhanced:img class="size-full object-cover" src={ContentImg} alt="Content Image" />
			</a>
		{/snippet}
	</HoverCardTrigger>
	<HoverCardContent class="w-[320px]" showArrow>
		<div class="space-y-3">
			<div class="space-y-1">
				<h2 class="font-semibold">Building a Design System with Svelte and Tailwind CSS</h2>
				<p class="text-muted-foreground text-sm">
					Learn how to build a comprehensive design system using Tailwind CSS, including component
					architecture, and theme customization.
				</p>
			</div>
			<div class="text-muted-foreground flex items-center gap-2 text-xs">
				<span>8 min read</span>
				<span>·</span>
				<span>Updated 2 days ago</span>
			</div>
		</div>
	</HoverCardContent>
</HoverCard>
