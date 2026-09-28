<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import ChevronUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { SettingsMenu, UserMenu } from '$lib/components/_extras/navbars';
	import {
		Breadcrumb,
		BreadcrumbItem,
		BreadcrumbList,
		BreadcrumbSeparator
	} from '$lib/components/ui/breadcrumb';
	import {
		NavigationMenuItem,
		NavigationMenuLink,
		NavigationMenuList,
		NavigationMenuRoot
	} from '$lib/components/ui/navigation-menu';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
	import { Select, SelectContent, SelectItem } from '$lib/components/ui/select';
	import { Select as SelectPrimitive } from 'bits-ui';

	const navigationLinks = [
		{ href: '#', label: 'Dashboard' },
		{ href: '#', label: 'Docs' },
		{ href: '#', label: 'API reference' }
	];

	const accountTypes = [
		{ label: 'Personal', value: 'personal' },
		{ label: 'Team', value: 'team' },
		{ label: 'Business', value: 'business' }
	];
	let selectedAccountType = $state(accountTypes[0].value);

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
			<!-- Mobile menu trigger -->
			<Popover>
				<PopoverTrigger>
					{#snippet child({ props })}
						<Button class="group size-8 md:hidden" variant="ghost" size="icon" {...props}>
							<svg
								class="pointer-events-none"
								width={16}
								height={16}
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M4 12L20 12"
									class="origin-center -translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-315"
								/>
								<path
									d="M4 12H20"
									class="origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,0.25,1.8)] group-aria-expanded:rotate-45"
								/>
								<path
									d="M4 12H20"
									class="origin-center translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135"
								/>
							</svg>
						</Button>
					{/snippet}
				</PopoverTrigger>
				<PopoverContent align="start" class="w-36 p-1 md:hidden">
					<NavigationMenuRoot class="max-w-none *:w-full">
						<NavigationMenuList class="flex-col items-start gap-0 md:gap-2">
							{#each navigationLinks as link (link.label)}
								<NavigationMenuItem class="w-full">
									<NavigationMenuLink href={link.href} class="py-1.5">
										{link.label}
									</NavigationMenuLink>
								</NavigationMenuItem>
							{/each}
						</NavigationMenuList>
					</NavigationMenuRoot>
				</PopoverContent>
			</Popover>
			<!-- Breadcrumb -->
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<Select
							type="single"
							onValueChange={(value) => {
								selectedAccountType = value;
							}}
							items={accountTypes}
						>
							<SelectPrimitive.Trigger aria-label="Select account type">
								{#snippet child({ props })}
									<Button
										variant="ghost"
										class="text-foreground focus-visible:bg-accent h-8 p-1.5 focus-visible:ring-0"
										{...props}
									>
										<span>
											{#if selectedAccountType}
												{accountTypes.find((a) => a.value === selectedAccountType)?.label ||
													'Select account type'}
											{/if}
										</span>
										<ChevronUpDownIcon size={14} class="text-muted-foreground/80" />
									</Button>
								{/snippet}
							</SelectPrimitive.Trigger>
							<SelectContent
								class="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2"
							>
								{#each accountTypes as accountType (accountType.value)}
									<SelectItem value={accountType.value}>{accountType.label}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</BreadcrumbItem>
					<BreadcrumbSeparator>/</BreadcrumbSeparator>
					<BreadcrumbItem>
						<Select
							type="single"
							onValueChange={(value) => {
								selectedProject = value;
							}}
							items={projects}
						>
							<SelectPrimitive.Trigger aria-label="Select project">
								{#snippet child({ props })}
									<Button
										variant="ghost"
										class="text-foreground focus-visible:bg-accent h-8 p-1.5 focus-visible:ring-0"
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
								{#each projects as project (project.value)}
									<SelectItem value={project.value}>{project.label}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
		</div>
		<!-- Right side -->
		<div class="flex items-center gap-4">
			<div class="flex items-center gap-2">
				<!-- Nav menu -->
				<NavigationMenuRoot class="max-md:hidden">
					<NavigationMenuList class="gap-2">
						{#each navigationLinks as link (link.label)}
							<NavigationMenuItem>
								<NavigationMenuLink
									href={link.href}
									class="text-muted-foreground hover:text-primary py-1.5 font-medium"
								>
									{link.label}
								</NavigationMenuLink>
							</NavigationMenuItem>
						{/each}
					</NavigationMenuList>
				</NavigationMenuRoot>
				<!-- Settings -->
				<SettingsMenu />
			</div>
			<!-- User menu -->
			<UserMenu />
		</div>
	</div>
</header>
