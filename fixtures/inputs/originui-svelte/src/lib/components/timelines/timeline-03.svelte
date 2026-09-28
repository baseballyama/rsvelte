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
			description:
				'Initial team meeting and project scope definition. Established key milestones and resource allocation.',
			id: 1,
			title: 'Project Kickoff'
		},
		{
			date: 'Mar 22, 2024',
			description:
				'Completed wireframes and user interface mockups. Stakeholder review and feedback incorporated.',
			id: 2,
			title: 'Design Phase'
		},
		{
			date: 'Apr 5, 2024',
			description: 'Backend API implementation and frontend component development in progress.',
			id: 3,
			title: 'Development Sprint'
		},
		{
			date: 'Apr 19, 2024',
			description:
				'Quality assurance testing, performance optimization, and production deployment preparation.',
			id: 4,
			title: 'Testing & Deployment'
		}
	];
</script>

<Timeline defaultValue={3}>
	{#each items as item (item.id)}
		<TimelineItem step={item.id}>
			<TimelineHeader>
				<TimelineSeparator />
				<TimelineDate>{item.date}</TimelineDate>
				<TimelineTitle>{item.title}</TimelineTitle>
				<TimelineIndicator />
			</TimelineHeader>
			<TimelineContent>{item.description}</TimelineContent>
		</TimelineItem>
	{/each}
</Timeline>
