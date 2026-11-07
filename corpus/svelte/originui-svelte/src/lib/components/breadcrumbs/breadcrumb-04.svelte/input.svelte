<script lang="ts">
	import Component from '@lucide/svelte/icons/component';
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
			<BreadcrumbLink href="#title" class="inline-flex items-center gap-1.5">
				<Home size={16} aria-hidden="true" />
				Home
			</BreadcrumbLink>
		</BreadcrumbItem>
		<BreadcrumbSeparator />
		<BreadcrumbItem>
			<BreadcrumbLink href="#title" class="inline-flex items-center gap-1.5">
				<Component size={16} aria-hidden="true" />
				Components
			</BreadcrumbLink>
		</BreadcrumbItem>
		<BreadcrumbSeparator />
		<BreadcrumbItem>
			<BreadcrumbPage>Breadcrumb</BreadcrumbPage>
		</BreadcrumbItem>
	</BreadcrumbList>
</Breadcrumb>
