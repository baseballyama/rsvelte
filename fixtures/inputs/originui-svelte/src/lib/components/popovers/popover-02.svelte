<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';

	import Bell from '@lucide/svelte/icons/bell';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

	const initialNotifications = [
		{
			action: 'requested review on',
			id: 1,
			target: 'PR #42: Feature implementation',
			timestamp: '15 minutes ago',
			unread: true,
			user: 'Chris Tompson'
		},
		{
			action: 'shared',
			id: 2,
			target: 'New component library',
			timestamp: '45 minutes ago',
			unread: true,
			user: 'Emma Davis'
		},
		{
			action: 'assigned you to',
			id: 3,
			target: 'API integration task',
			timestamp: '4 hours ago',
			unread: false,
			user: 'James Wilson'
		},
		{
			action: 'replied to your comment in',
			id: 4,
			target: 'Authentication flow',
			timestamp: '12 hours ago',
			unread: false,
			user: 'Alex Morgan'
		},
		{
			action: 'commented on',
			id: 5,
			target: 'Dashboard redesign',
			timestamp: '2 days ago',
			unread: false,
			user: 'Sarah Chen'
		},
		{
			action: 'mentioned you in',
			id: 6,
			target: 'Origin UI open graph image',
			timestamp: '2 weeks ago',
			unread: false,
			user: 'Miky Derya'
		}
	];

	let notifications = $state(initialNotifications);
	const unreadCount = $derived(notifications.filter((n) => n.unread).length);

	function handleMarkAllAsRead() {
		notifications = notifications.map((n) => {
			n.unread = false;
			return n;
		});
	}

	function handleNotificationClick(id: number) {
		notifications = notifications.map((n) => {
			if (n.id === id) {
				n.unread = false;
			}
			return n;
		});
	}
</script>

{#snippet Dot(className = '')}
	<svg
		width="6"
		height="6"
		fill="currentColor"
		viewBox="0 0 6 6"
		xmlns="http://www.w3.org/2000/svg"
		class={className}
		aria-hidden="true"
	>
		<circle cx="3" cy="3" r="3" />
	</svg>
{/snippet}

<Popover>
	<PopoverTrigger>
		{#snippet child({ props })}
			<Button
				size="icon"
				variant="outline"
				class="relative"
				aria-label="Open notifications"
				{...props}
			>
				<Bell size={16} aria-hidden="true" />
				{#if unreadCount > 0}
					<Badge class="absolute -top-2 left-full min-w-5 -translate-x-1/2 px-1">
						{unreadCount > 99 ? '99+' : unreadCount}
					</Badge>
				{/if}
			</Button>
		{/snippet}
	</PopoverTrigger>
	<PopoverContent class="w-80 p-1">
		<div class="flex items-baseline justify-between gap-4 px-3 py-2">
			<div class="text-sm font-semibold">Notifications</div>
			{#if unreadCount > 0}
				<button class="text-xs font-medium hover:underline" onclick={handleMarkAllAsRead}>
					Mark all as read
				</button>
			{/if}
		</div>
		<div role="separator" aria-orientation="horizontal" class="bg-border -mx-1 my-1 h-px"></div>

		{#each notifications as notification (notification.id)}
			<div class="hover:bg-accent rounded-md px-3 py-2 text-sm transition-colors">
				<div class="relative flex items-start pe-3">
					<div class="flex-1 space-y-1">
						<button
							class="text-foreground/80 text-left after:absolute after:inset-0"
							onclick={() => handleNotificationClick(notification.id)}
						>
							<span class="text-foreground font-medium hover:underline">
								{notification.user}
							</span>
							{notification.action}
							<span class="text-foreground font-medium hover:underline">
								{notification.target}
							</span>
							.
						</button>
						<div class="text-muted-foreground text-xs">{notification.timestamp}</div>
					</div>
					{#if notification.unread}
						<div class="absolute end-0 self-center">
							<span class="sr-only">Unread</span>
							{@render Dot()}
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</PopoverContent>
</Popover>
