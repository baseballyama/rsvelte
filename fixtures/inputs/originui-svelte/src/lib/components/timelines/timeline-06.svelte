<script lang="ts">
	import GitCompare from '@lucide/svelte/icons/git-compare';
	import GitFork from '@lucide/svelte/icons/git-fork';
	import GitMerge from '@lucide/svelte/icons/git-merge';
	import GitPullRequest from '@lucide/svelte/icons/git-pull-request';
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
			date: '15 minutes ago',
			description: 'Forked the repository to create a new branch for development.',
			icon: GitFork,
			id: 1,
			title: 'Forked Repository'
		},
		{
			date: '10 minutes ago',
			description:
				'Submitted PR #342 with new feature implementation. Waiting for code review from team leads.',
			icon: GitPullRequest,
			id: 2,
			title: 'Pull Request Submitted'
		},
		{
			date: '5 minutes ago',
			description:
				'Received comments on PR. Minor adjustments needed in error handling and documentation.',
			icon: GitCompare,
			id: 3,
			title: 'Comparing Branches'
		},
		{
			description: 'Merged the feature branch into the main branch. Ready for deployment.',
			icon: GitMerge,
			id: 4,
			title: 'Merged Branch'
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
				<TimelineTitle class="mt-0.5">{item.title}</TimelineTitle>
				<TimelineIndicator
					class="bg-primary/10 group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground flex size-6 items-center justify-center border-none group-data-[orientation=vertical]/timeline:-left-7"
				>
					<item.icon size={14} />
				</TimelineIndicator>
			</TimelineHeader>
			<TimelineContent>
				{item.description}
				<TimelineDate class="mt-2 mb-0">{item.date}</TimelineDate>
			</TimelineContent>
		</TimelineItem>
	{/each}
</Timeline>
