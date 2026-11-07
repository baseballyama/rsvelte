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
	<BreadcrumbList>
		<BreadcrumbItem>
			<BreadcrumbLink href="#">
				<Home size={16} aria-hidden="true" />
				<span class="sr-only">Home</span>
			</BreadcrumbLink>
		</BreadcrumbItem>
		<BreadcrumbSeparator>/</BreadcrumbSeparator>
		<BreadcrumbItem>
			<BreadcrumbLink href="#">Components</BreadcrumbLink>
		</BreadcrumbItem>
		<BreadcrumbSeparator>/</BreadcrumbSeparator>
		<BreadcrumbItem>
			<BreadcrumbPage>Breadcrumb</BreadcrumbPage>
		</BreadcrumbItem>
	</BreadcrumbList>
</Breadcrumb>
