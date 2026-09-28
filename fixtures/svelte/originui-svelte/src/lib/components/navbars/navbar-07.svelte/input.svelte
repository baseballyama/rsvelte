<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import ChevronUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { Logo, NotificationMenu, UserMenu } from '$lib/components/_extras/navbars';
	import {
		Breadcrumb,
		BreadcrumbEllipsis,
		BreadcrumbItem,
		BreadcrumbLink,
		BreadcrumbList,
		BreadcrumbSeparator
	} from '$lib/components/ui/breadcrumb';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdowns';
	import { Select, SelectContent, SelectItem } from '$lib/components/ui/select';
	import { Select as SelectPrimitive } from 'bits-ui';

	const projects = [
		{ label: 'Main project', value: '1' },
		{ label: 'Origin-Svelte project', value: '2' }
	];
	let selectedProject = $state(projects[0].value);
</script>

<header class="border-b px-4 md:px-6">
	<div class="flex h-16 items-center justify-between gap-4">
		<!-- Left side -->
		<div class="flex items-center gap-2">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="#" class="text-foreground">
							<Logo />
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator>/</BreadcrumbSeparator>
					<BreadcrumbItem class="md:hidden">
						<DropdownMenu>
							<DropdownMenuTrigger class="hover:text-foreground">
								<BreadcrumbEllipsis />
								<span class="sr-only">Toggle menu</span>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start">
								<DropdownMenuItem>
									{#snippet child({ props })}
										<a href="#" {...props}>Personal Account</a>
									{/snippet}
								</DropdownMenuItem>
								<DropdownMenuItem>
									{#snippet child({ props })}
										<a href="#" {...props}>Projects</a>
									{/snippet}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</BreadcrumbItem>
					<BreadcrumbItem class="max-md:hidden">
						<BreadcrumbLink href="#">Personal Account</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator class="max-md:hidden">/</BreadcrumbSeparator>
					<BreadcrumbItem class="max-md:hidden">
						<BreadcrumbLink href="#">Projects</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator>/</BreadcrumbSeparator>
					<BreadcrumbItem>
						<Select
							type="single"
							onValueChange={(value) => (selectedProject = value)}
							items={projects}
						>
							<SelectPrimitive.Trigger aria-label="Select project">
								{#snippet child({ props })}
									<Button
										variant="ghost"
										class="text-foreground focus-visible:bg-accent h-8 px-1.5 focus-visible:ring-0"
										{...props}
									>
										<span>
											{#if selectedProject}
												{projects.find((p) => p.value === selectedProject)?.label ||
													'Select project'}
											{/if}
										</span>
										<ChevronUpDownIcon size={14} class="text-muted-foreground/80" />
									</Button>
								{/snippet}
							</SelectPrimitive.Trigger>
							<SelectContent
								class="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2"
							>
								{#each projects as { label, value } (value)}
									<SelectItem {value}>
										{label}
									</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
		</div>
		<!-- Right side -->
		<div class="flex items-center gap-4">
			<!-- Notification -->
			<NotificationMenu />
			<!-- User menu -->
			<UserMenu />
		</div>
	</div>
</header>
