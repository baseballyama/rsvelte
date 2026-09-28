<script lang="ts">
	import { Timeline, TimelineContent, TimelineItem } from '$lib/components/ui/timeline';
	type ActionType = 'create' | 'edit' | 'post' | 'reply';

	import type { Icon as IconType } from '@lucide/svelte';

	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Avatar02 from '$lib/assets/avatar-40-02.jpg?w=48&h=48&enhanced';
	const items: {
		action: ActionType;
		date: Date;
		id: number;
		image: Picture;
		user: string;
	}[] = [
		{
			action: 'post',
			date: new Date(Date.now() - 59000), // 59 seconds ago
			id: 1,
			image: Avatar02,
			user: 'Matt'
		},
		{
			action: 'reply',
			date: new Date(Date.now() - 180000), // 3 minutes ago
			id: 2,
			image: Avatar02,
			user: 'Matt'
		},
		{
			action: 'edit',
			date: new Date(Date.now() - 300000), // 5 minutes ago
			id: 3,
			image: Avatar02,
			user: 'Matt'
		},
		{
			action: 'create',
			date: new Date(Date.now() - 600000), // 10 minutes ago
			id: 4,
			image: Avatar02,
			user: 'Matt'
		}
	];

	function getActionIcon(action: ActionType): typeof IconType {
		const icons: Record<ActionType, typeof IconType> = {
			create: PlusIcon,
			edit: PencilIcon,
			post: BookOpenIcon,
			reply: MessageCircleIcon
		};
		return icons[action];
	}

	function getActionText(action: ActionType): string {
		const texts: Record<ActionType, string> = {
			create: 'created a new project',
			edit: 'edited a post',
			post: 'wrote a new post',
			reply: 'replied to a comment'
		};
		return texts[action];
	}

	function getRelativeTimeString(date: Date): string {
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (diffInSeconds < 60) {
			return `${diffInSeconds} seconds ago`;
		} else if (diffInSeconds < 3600) {
			const minutes = Math.floor(diffInSeconds / 60);
			return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
		} else if (diffInSeconds < 86400) {
			const hours = Math.floor(diffInSeconds / 3600);
			return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
		} else {
			const days = Math.floor(diffInSeconds / 86400);
			return `${days} ${days === 1 ? 'day' : 'days'} ago`;
		}
	}
</script>

<div class="space-y-3">
	<div class="text-muted-foreground text-xs font-medium">Activity</div>
	<Timeline>
		{#each items as item (item.id)}
			{@const ActionIcon = getActionIcon(item.action)}
			<TimelineItem step={item.id} class="m-0! flex-row items-center gap-3 py-2.5!">
				<ActionIcon class="text-muted-foreground/80" size={16} />
				<enhanced:img src={item.image} alt={item.user} class="size-6 rounded-full" />
				<TimelineContent class="text-foreground">
					<a class="font-medium hover:underline" href="#">
						{item.user}
					</a>
					<span class="font-normal">
						{getActionText(item.action)}
						<a class="hover:underline" href="#">
							{getRelativeTimeString(item.date)}
						</a>
					</span>
				</TimelineContent>
			</TimelineItem>
		{/each}
	</Timeline>
</div>
