<script lang="ts">
	import Avatar01 from '$lib/assets/avatar-40-01.jpg?w=48&h=48&enhanced';
	import Avatar02 from '$lib/assets/avatar-40-02.jpg?w=48&h=48&enhanced';
	import Avatar03 from '$lib/assets/avatar-40-03.jpg?w=48&h=48&enhanced';
	import Avatar05 from '$lib/assets/avatar-40-05.jpg?w=48&h=48&enhanced';
	import {
		Timeline,
		TimelineContent,
		TimelineDate,
		TimelineHeader,
		TimelineIndicator,
		TimelineItem,
		TimelineSeparator,
		TimelineTitle
	} from '$lib/components/ui/timeline';

	const items = [
		{
			action: 'opened a new issue',
			date: '15 minutes ago',
			description:
				"I'm having trouble with the new component library. It's not rendering properly.",
			id: 1,
			image: Avatar01,
			title: 'Hannah Kandell'
		},
		{
			action: 'commented on',
			date: '10 minutes ago',
			description:
				"Hey Hannah, I'm having trouble with the new component library. It's not rendering properly.",
			id: 2,
			image: Avatar02,
			title: 'Chris Tompson'
		},
		{
			action: 'assigned you to',
			date: '5 minutes ago',
			description: 'The new component library is not rendering properly. Can you take a look?',
			id: 3,
			image: Avatar03,
			title: 'Emma Davis'
		},
		{
			action: 'closed the issue',
			date: '2 minutes ago',
			description: 'The issue has been fixed. Please review the changes.',
			id: 4,
			image: Avatar05,
			title: 'Alex Morgan'
		}
	];
</script>

<Timeline>
	{#each items as item (item.id)}
		<TimelineItem
			step={item.id}
			class="not-last:group-data-[orientation=vertical]/timeline:ms-10 not-last:group-data-[orientation=vertical]/timeline:pb-8"
		>
			<TimelineHeader>
				<TimelineSeparator
					class="group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6.5"
				/>

				<TimelineTitle class="mt-0.5">
					{item.title}
					<span class="text-muted-foreground text-sm font-normal">
						{item.action}
					</span>
				</TimelineTitle>
				<TimelineIndicator
					class="bg-primary/10 group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground flex size-6 items-center justify-center border-none group-data-[orientation=vertical]/timeline:-left-7"
				>
					<enhanced:img src={item.image} alt={item.title} class="size-6 rounded-full" />
				</TimelineIndicator>
			</TimelineHeader>
			<TimelineContent class="text-foreground mt-2 rounded-lg border px-4 py-3">
				{item.description}
				<TimelineDate class="mt-1 mb-0">{item.date}</TimelineDate>
			</TimelineContent>
		</TimelineItem>
	{/each}
</Timeline>
