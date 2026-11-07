<script lang="ts">
	import Home from '@lucide/svelte/icons/home';
	import {
		Breadcrumb,
		BreadcrumbItem,
		BreadcrumbLink,
		BreadcrumbList,
		BreadcrumbPage,
		BreadcrumbSeparator
	} from '$lib/components/ui/breadcrumb';
</script>

<Breadcrumb>
	<BreadcrumbList
		class="border-border bg-background rounded-lg border px-3 py-2 shadow-xs shadow-black/5"
	>
		<BreadcrumbItem>
			<BreadcrumbLink href="#title">
				<Home size={16} aria-hidden="true" />
				<span class="sr-only">Home</span>
			</BreadcrumbLink>
		</BreadcrumbItem>
		<BreadcrumbSeparator />
		<BreadcrumbItem>
			<BreadcrumbLink href="#title">Components</BreadcrumbLink>
		</BreadcrumbItem>
		<BreadcrumbSeparator />
		<BreadcrumbItem>
			<BreadcrumbPage>Breadcrumb</BreadcrumbPage>
		</BreadcrumbItem>
	</BreadcrumbList>
</Breadcrumb>
