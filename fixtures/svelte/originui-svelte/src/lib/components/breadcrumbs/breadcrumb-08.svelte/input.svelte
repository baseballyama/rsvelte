<script lang="ts">
	import Database from '@lucide/svelte/icons/database';
	import {
		Breadcrumb,
		BreadcrumbItem,
		BreadcrumbLink,
		BreadcrumbList,
		BreadcrumbSeparator
	} from '$lib/components/ui/breadcrumb';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';

	let value = $state('s1');
	const items = [
		{ label: 'Orion', value: 's1' },
		{ label: 'Sigma', value: 's2' },
		{ label: 'Dorado', value: 's3' }
	];

	const selectedItem = $derived(items.find((item) => item.value === value));
</script>

<Breadcrumb>
	<BreadcrumbList>
		<BreadcrumbItem>
			<BreadcrumbLink href="#">Databases</BreadcrumbLink>
		</BreadcrumbItem>
		<BreadcrumbSeparator />
		<BreadcrumbItem>
			<Select type="single" bind:value allowDeselect={false}>
				<SelectTrigger id="select-database" class="relative ps-9" aria-label="Select database">
					<div
						class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[[disabled]]:opacity-50"
					>
						<Database size={16} aria-hidden="true" />
					</div>

					{selectedItem?.label ?? 'Select database'}
				</SelectTrigger>
				<SelectContent>
					{#each items as item (item.value)}
						<SelectItem value={item.value}>{item.label}</SelectItem>
					{/each}
				</SelectContent>
			</Select>
		</BreadcrumbItem>
	</BreadcrumbList>
</Breadcrumb>
