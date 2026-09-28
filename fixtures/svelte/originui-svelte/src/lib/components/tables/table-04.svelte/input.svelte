<script lang="ts">
	import {
		Table,
		TableBody,
		TableCell,
		TableFooter,
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
			<TableRow class="hover:bg-transparent">
				<TableHead>Name</TableHead>
				<TableHead>Email</TableHead>
				<TableHead>Location</TableHead>
				<TableHead>Status</TableHead>
				<TableHead class="text-right">Balance</TableHead>
			</TableRow>
		</TableHeader>
		<tbody aria-hidden="true" class="table-row h-2"></tbody>
		<TableBody class="[&_td:first-child]:rounded-l-lg [&_td:last-child]:rounded-r-lg">
			{#each items as item (item.id)}
				<TableRow class="odd:bg-muted/50 odd:hover:bg-muted/50 border-none hover:bg-transparent">
					<TableCell class="py-2.5 font-medium">{item.name}</TableCell>
					<TableCell class="py-2.5">{item.email}</TableCell>
					<TableCell class="py-2.5">{item.location}</TableCell>
					<TableCell class="py-2.5">{item.status}</TableCell>
					<TableCell class="py-2.5 text-right">
						{item.balance}
					</TableCell>
				</TableRow>
			{/each}
		</TableBody>
		<tbody aria-hidden="true" class="table-row h-2"></tbody>
		<TableFooter class="bg-transparent">
			<TableRow class="hover:bg-transparent">
				<TableCell colspan={4}>Total</TableCell>
				<TableCell class="text-right">$2,500.00</TableCell>
			</TableRow>
		</TableFooter>
	</Table>
	<p class="text-muted-foreground mt-4 text-center text-sm">Striped table</p>
</div>
