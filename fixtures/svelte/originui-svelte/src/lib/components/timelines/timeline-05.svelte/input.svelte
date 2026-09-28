<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
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
		<TimelineItem step={item.id} class="group-data-[orientation=vertical]/timeline:ms-10">
			<TimelineHeader>
				<TimelineSeparator
					class="group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6.5"
				/>
				<TimelineDate>{item.date}</TimelineDate>
				<TimelineTitle>{item.title}</TimelineTitle>
				<TimelineIndicator
					class="group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground flex size-6 items-center justify-center group-data-completed/timeline-item:border-none group-data-[orientation=vertical]/timeline:-left-7"
				>
					<CheckIcon class="group-[:not([data-completed])]/timeline-item:hidden" size={16} />
				</TimelineIndicator>
			</TimelineHeader>
			<TimelineContent>{item.description}</TimelineContent>
		</TimelineItem>
	{/each}
</Timeline>
