<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import BookmarkIcon from '@lucide/svelte/icons/bookmark';
	import HomeIcon from '@lucide/svelte/icons/home';
	// import { DatePicker, Filters } from '$lib/components/_extras/navbars';
	import { Filters } from '$lib/components/_extras/navbars';
	import {
		Breadcrumb,
		BreadcrumbItem,
		BreadcrumbLink,
		BreadcrumbList,
		BreadcrumbPage,
		BreadcrumbSeparator
	} from '$lib/components/ui/breadcrumb';
</script>

<header class="border-b px-4 md:px-6">
	<div class="flex h-16 items-center justify-between gap-4">
		<!-- Left side -->
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="#">
						<HomeIcon size={16} aria-hidden="true" />
						<span class="sr-only">Home</span>
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>Reports</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
		<!-- Right side -->
		<div class="flex items-center gap-2">
			<!-- Date picker -->
			<!-- <DatePicker /> -->
			<!-- Filters -->
			<Filters />
			<!-- Saved button -->
			<Button size="sm" variant="outline" class="aspect-square text-sm max-sm:p-0">
				<BookmarkIcon class="text-muted-foreground/80 sm:-ms-1" size={16} aria-hidden="true" />
				<span class="max-sm:sr-only">Saved</span>
			</Button>
		</div>
	</div>
</header>
