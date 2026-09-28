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
			image:
				'https://res.cloudinary.com/dlzlfasou/image/upload/v1736358071/avatar-40-02_upqrxi.jpg',
			location: 'San Francisco, US',
			name: 'Alex Thompson',
			status: 'Active',
			username: '@alexthompson'
		},
		{
			balance: '$600.00',
			email: 'sarah.c@company.com',
			id: '2',
			image:
				'https://res.cloudinary.com/dlzlfasou/image/upload/v1736358073/avatar-40-01_ij9v7j.jpg',
			location: 'Singapore',
			name: 'Sarah Chen',
			status: 'Active',
			username: '@sarahchen'
		},
		{
			balance: '$0.00',
			email: 'm.garcia@company.com',
			id: '4',
			image:
				'https://res.cloudinary.com/dlzlfasou/image/upload/v1736358072/avatar-40-03_dkeufx.jpg',
			location: 'Madrid, Spain',
			name: 'Maria Garcia',
			status: 'Active',
			username: '@mariagarcia'
		},
		{
			balance: '-$1,000.00',
			email: 'd.kim@company.com',
			id: '5',
			image:
				'https://res.cloudinary.com/dlzlfasou/image/upload/v1736358070/avatar-40-05_cmz0mg.jpg',
			location: 'Seoul, KR',
			name: 'David Kim',
			status: 'Active',
			username: '@davidkim'
		}
	];
</script>

<div>
	<Table>
		<TableHeader>
			<TableRow class="hover:bg-transparent">
				<TableHead>Name</TableHead>
				<TableHead>Email</TableHead>
				<TableHead>Location</TableHead>
				<TableHead>Status</TableHead>
				<TableHead class="text-right">Balance</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			{#each items as item (item.id)}
				<TableRow>
					<TableCell>
						<div class="flex items-center gap-3">
							<img class="rounded-full" src={item.image} width={40} height={40} alt={item.name} />
							<div>
								<div class="font-medium">{item.name}</div>
								<span class="text-muted-foreground mt-0.5 text-xs">
									{item.username}
								</span>
							</div>
						</div>
					</TableCell>
					<TableCell>{item.email}</TableCell>
					<TableCell>{item.location}</TableCell>
					<TableCell>{item.status}</TableCell>
					<TableCell class="text-right">{item.balance}</TableCell>
				</TableRow>
			{/each}
		</TableBody>
	</Table>
	<p class="text-muted-foreground mt-4 text-center text-sm">Table with images</p>
</div>
