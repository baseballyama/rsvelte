<script lang="ts">
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
			date: 'Mar 15, 2024',
			description: 'Initial team meeting.',
			id: 1,
			title: 'Project Kickoff'
		},
		{
			date: 'Mar 22, 2024',
			description: 'Completed wireframes.',
			id: 2,
			title: 'Design Phase'
		},
		{
			date: 'Apr 5, 2024',
			description: 'Backend development.',
			id: 3,
			title: 'Development Sprint'
		},
		{
			date: 'Apr 19, 2024',
			description: 'Performance optimization.',
			id: 4,
			title: 'Testing & Deployment'
		}
	];
</script>

<Timeline defaultValue={3} orientation="horizontal">
	{#each items as item (item.id)}
		<TimelineItem step={item.id} class="group-data-[orientation=horizontal]/timeline:mt-0">
			<TimelineHeader>
				<TimelineSeparator class="group-data-[orientation=horizontal]/timeline:top-8" />
				<TimelineDate class="mb-10">{item.date}</TimelineDate>
				<TimelineTitle>{item.title}</TimelineTitle>
				<TimelineIndicator class="group-data-[orientation=horizontal]/timeline:top-8" />
			</TimelineHeader>
			<TimelineContent>{item.description}</TimelineContent>
		</TimelineItem>
	{/each}
</Timeline>
