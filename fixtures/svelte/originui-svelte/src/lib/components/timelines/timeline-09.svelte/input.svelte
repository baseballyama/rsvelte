<script lang="ts">
	import {
		Timeline,
		TimelineContent,
		TimelineDate,
		TimelineItem
	} from '$lib/components/ui/timeline';

	const items = [
		{
			date: new Date('2024-01-09T10:55:00'),
			description: 'System backup completed successfully.',
			id: 1
		},
		{
			date: new Date('2024-01-09T10:50:00'),
			description: 'User authentication service restarted due to configuration update.',
			id: 2
		},
		{
			date: new Date('2024-01-09T10:45:00'),
			description: 'Warning: High CPU usage detected on worker node-03.',
			id: 3
		},
		{
			date: new Date('2024-01-09T10:40:00'),
			description: 'New deployment initiated for api-service v2.1.0.',
			id: 4
		}
	];
</script>

<Timeline class="divide-y rounded-lg border">
	{#each items as item (item.id)}
		<TimelineItem step={item.id} class="m-0! px-4! py-3!">
			<TimelineContent class="text-foreground">
				{item.description}
				<TimelineDate class="mt-1">
					{item.date.toLocaleDateString('en-US', {
						day: 'numeric',
						month: 'long',
						year: 'numeric'
					})}
					at
					{item.date.toLocaleTimeString('en-US', {
						hour: 'numeric',
						hour12: true,
						minute: '2-digit'
					})}
				</TimelineDate>
			</TimelineContent>
		</TimelineItem>
	{/each}
</Timeline>
