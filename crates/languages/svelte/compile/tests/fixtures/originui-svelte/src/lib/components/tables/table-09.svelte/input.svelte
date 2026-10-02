<script lang="ts">
	import { Table, TableBody, TableCell, TableRow } from '$lib/components/ui/table';
</script>

<div class="mx-auto max-w-lg">
	<div class="bg-background overflow-hidden rounded-md border">
		<Table>
			<TableBody>
				<TableRow class="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
					<TableCell class="bg-muted/50 py-2 font-medium">Name</TableCell>
					<TableCell class="py-2">David Kim</TableCell>
				</TableRow>
				<TableRow class="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
					<TableCell class="bg-muted/50 py-2 font-medium">Email</TableCell>
					<TableCell class="py-2">d.kim@company.com</TableCell>
				</TableRow>
				<TableRow class="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
					<TableCell class="bg-muted/50 py-2 font-medium">Location</TableCell>
					<TableCell class="py-2">Seoul, KR</TableCell>
				</TableRow>
				<TableRow class="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
					<TableCell class="bg-muted/50 py-2 font-medium">Status</TableCell>
					<TableCell class="py-2">Active</TableCell>
				</TableRow>
				<TableRow class="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
					<TableCell class="bg-muted/50 py-2 font-medium">Balance</TableCell>
					<TableCell class="py-2">$1,000.00</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	</div>
	<p class="text-muted-foreground mt-4 text-center text-sm">Vertical table</p>
</div>
