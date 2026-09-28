<script lang="ts">
	import {
		Timeline,
		TimelineDate,
		TimelineHeader,
		TimelineIndicator,
		TimelineItem,
		TimelineSeparator,
		TimelineTitle
	} from '$lib/components/ui/timeline';

	const items = [
		{
			date: 'Mar 15, 2024',
			id: 1,
			title: 'Project Kickoff'
		},
		{
			date: 'Mar 22, 2024',
			id: 2,
			title: 'Design Phase'
		},
		{
			date: 'Apr 5, 2024',
			id: 3,
			title: 'Development Sprint'
		},
		{
			date: 'Apr 19, 2024',
			id: 4,
			title: 'Testing & Deployment'
		},
		{
			date: 'May 3, 2024',
			id: 5,
			title: 'User Training'
		},
		{
			date: 'May 17, 2024',
			id: 6,
			title: 'Project Handover'
		}
	];
</script>

<Timeline defaultValue={3}>
	{#each items as item (item.id)}
		<TimelineItem
			step={item.id}
			class={[
				'w-[calc(50%-1.5rem)]',
				'odd:group-data-[orientation=vertical]/timeline:ms-auto',
				'even:group-data-[orientation=vertical]/timeline:text-right',
				'even:group-data-[orientation=vertical]/timeline:ml-0',
				'even:group-data-[orientation=vertical]/timeline:mr-8',
				'even:**:data-[slot=timeline-indicator]:group-data-[orientation=vertical]/timeline:-right-6',
				'even:**:data-[slot=timeline-indicator]:group-data-[orientation=vertical]/timeline:left-auto',
				'even:**:data-[slot=timeline-indicator]:group-data-[orientation=vertical]/timeline:translate-x-1/2',
				'even:**:data-[slot=timeline-separator]:group-data-[orientation=vertical]/timeline:-right-6',
				'even:**:data-[slot=timeline-separator]:group-data-[orientation=vertical]/timeline:left-auto',
				'even:**:data-[slot=timeline-separator]:group-data-[orientation=vertical]/timeline:translate-x-1/2'
			]}
		>
			<TimelineHeader>
				<TimelineSeparator />
				<TimelineDate>{item.date}</TimelineDate>
				<TimelineTitle>{item.title}</TimelineTitle>
				<TimelineIndicator />
			</TimelineHeader>
		</TimelineItem>
	{/each}
</Timeline>
