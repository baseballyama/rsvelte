<script lang="ts">
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';

	const items = [
		{
			balance: '$1,250.00',
			email: 'alex.t@company.com',
			id: '1',
			location: 'San Francisco, US',
			name: 'Alex Thompson',
			status: 'Active'
		},
		{
			balance: '$600.00',
			email: 'sarah.c@company.com',
			id: '2',
			location: 'Singapore',
			name: 'Sarah Chen',
			status: 'Active'
		},
		{
			balance: '$650.00',
			email: 'j.wilson@company.com',
			id: '3',
			location: 'London, UK',
			name: 'James Wilson',
			status: 'Inactive'
		},
		{
			balance: '$0.00',
			email: 'm.garcia@company.com',
			id: '4',
			location: 'Madrid, Spain',
			name: 'Maria Garcia',
			status: 'Active'
		},
		{
			balance: '-$1,000.00',
			email: 'd.kim@company.com',
			id: '5',
			location: 'Seoul, KR',
			name: 'David Kim',
			status: 'Active'
		}
	];
</script>

<div>
	<Table>
		<TableHeader class="bg-transparent">
			<TableRow class="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
				<TableHead>Name</TableHead>
				<TableHead>Email</TableHead>
				<TableHead>Location</TableHead>
				<TableHead>Status</TableHead>
				<TableHead class="text-right">Balance</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody class="[&_td:first-child]:rounded-l-lg [&_td:last-child]:rounded-r-lg">
			{#each items as item (item.id)}
				<TableRow class="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
					<TableCell class="font-medium">{item.name}</TableCell>
					<TableCell>{item.email}</TableCell>
					<TableCell>{item.location}</TableCell>
					<TableCell>{item.status}</TableCell>
					<TableCell class="text-right">{item.balance}</TableCell>
				</TableRow>
			{/each}
		</TableBody>
	</Table>
	<p class="text-muted-foreground mt-4 text-center text-sm">Table with vertical lines</p>
</div>
