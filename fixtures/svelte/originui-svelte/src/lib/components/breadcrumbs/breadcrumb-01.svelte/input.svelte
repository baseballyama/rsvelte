<script lang="ts">
	import {
		Breadcrumb,
		BreadcrumbEllipsis,
		BreadcrumbItem,
		BreadcrumbLink,
		BreadcrumbList,
		BreadcrumbPage,
		BreadcrumbSeparator
	} from '$lib/components/ui/breadcrumb';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdowns';
</script>

<Breadcrumb>
	<BreadcrumbList>
		<BreadcrumbItem>
			<BreadcrumbLink href="#title">Home</BreadcrumbLink>
		</BreadcrumbItem>
		<BreadcrumbSeparator />
		<BreadcrumbItem>
			<DropdownMenu>
				<DropdownMenuTrigger class="hover:text-foreground">
					<BreadcrumbEllipsis />
					<span class="sr-only">Toggle menu</span>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start">
					<DropdownMenuItem>
						{#snippet child({ props })}
							<a href="#title" {...props}>Documentation</a>
						{/snippet}
					</DropdownMenuItem>
					<DropdownMenuItem>
						{#snippet child({ props })}
							<a href="#title" {...props}>Themes</a>
						{/snippet}
					</DropdownMenuItem>
					<DropdownMenuItem>
						{#snippet child({ props })}
							<a href="#title" {...props}>GitHub</a>
						{/snippet}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</BreadcrumbItem>
		<BreadcrumbSeparator />
		<BreadcrumbItem>
			<BreadcrumbLink href="#">Components</BreadcrumbLink>
		</BreadcrumbItem>
		<BreadcrumbSeparator />
		<BreadcrumbItem>
			<BreadcrumbPage>Breadcrumb</BreadcrumbPage>
		</BreadcrumbItem>
	</BreadcrumbList>
</Breadcrumb>
