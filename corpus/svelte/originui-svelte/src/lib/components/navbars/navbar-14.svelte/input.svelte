<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import CompassIcon from '@lucide/svelte/icons/compass';
	import FeatherIcon from '@lucide/svelte/icons/feather';
	import HouseIcon from '@lucide/svelte/icons/house';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { NotificationMenu, TeamSwitcher, UserMenu } from '$lib/components/_extras/navbars';
	import {
		NavigationMenuItem,
		NavigationMenuLink,
		NavigationMenuList,
		NavigationMenuRoot
	} from '$lib/components/ui/navigation-menu';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

	const teams = ['Acme Inc.', 'Origin UI - Svelte', 'Junon'];

	// Navigation links array to be used in both desktop and mobile menus
	const navigationLinks = [
		{ href: '#', icon: HouseIcon, label: 'Dashboard' },
		{ href: '#', icon: CompassIcon, label: 'Explore' },
		{ href: '#', icon: FeatherIcon, label: 'Write' },
		{ href: '#', icon: SearchIcon, label: 'Search' }
	];
</script>

<header class="border-b px-4 md:px-6">
	<div class="flex h-16 items-center justify-between gap-4">
		<!-- Left side -->
		<div class="flex flex-1 items-center gap-2">
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
				<PopoverContent align="start" class="w-48 p-1 md:hidden">
					<NavigationMenuRoot class="max-w-none *:w-full">
						<NavigationMenuList class="flex-col items-start gap-0 md:gap-2">
							{#each navigationLinks as link (link.label)}
								<NavigationMenuItem class="w-full">
									<NavigationMenuLink href={link.href} class="flex-row items-center gap-2 py-1.5">
										<link.icon size={16} class="text-muted-foreground" aria-hidden="true" />
										<span>{link.label}</span>
									</NavigationMenuLink>
								</NavigationMenuItem>
							{/each}
						</NavigationMenuList>
					</NavigationMenuRoot>
				</PopoverContent>
			</Popover>
			<TeamSwitcher {teams} defaultTeam={teams[0]} />
		</div>
		<!-- Middle area -->
		<NavigationMenuRoot class="max-md:hidden">
			<NavigationMenuList class="gap-2">
				{#each navigationLinks as link (link.label)}
					<NavigationMenuItem>
						<NavigationMenuLink
							href={link.href}
							class="flex size-8 items-center justify-center p-1.5"
							title={link.label}
						>
							<link.icon aria-hidden="true" />
							<span class="sr-only">{link.label}</span>
						</NavigationMenuLink>
					</NavigationMenuItem>
				{/each}
			</NavigationMenuList>
		</NavigationMenuRoot>
		<!-- Right side -->
		<div class="flex flex-1 items-center justify-end gap-4">
			<Button size="sm" class="aspect-square text-sm max-sm:p-0">
				<PlusIcon class="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
				<span class="max-sm:sr-only">Post</span>
			</Button>
			<NotificationMenu />
			<UserMenu />
		</div>
	</div>
</header>
