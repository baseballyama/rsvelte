<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import HouseIcon from '@lucide/svelte/icons/house';
	import InboxIcon from '@lucide/svelte/icons/inbox';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import ZapIcon from '@lucide/svelte/icons/zap';
	import { Logo, UserMenu } from '$lib/components/_extras/navbars';
	import {
		NavigationMenuItem,
		NavigationMenuLink,
		NavigationMenuList,
		NavigationMenuRoot
	} from '$lib/components/ui/navigation-menu';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

	// Navigation links array
	const navigationLinks = [
		{ active: true, href: '#', icon: HouseIcon, label: 'Home' },
		{ href: '#', icon: InboxIcon, label: 'Inbox' },
		{ href: '#', icon: ZapIcon, label: 'Insights' }
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
				<PopoverContent align="start" class="w-36 p-1 md:hidden">
					<NavigationMenuRoot class="max-w-none *:w-full">
						<NavigationMenuList class="flex-col items-start gap-0 md:gap-2">
							{#each navigationLinks as link (link.label)}
								<NavigationMenuItem class="w-full">
									<NavigationMenuLink
										href={link.href}
										class="flex-row items-center gap-2 py-1.5"
										active={link.active}
									>
										<link.icon size={16} class="text-muted-foreground/80" aria-hidden="true" />
										<span>{link.label}</span>
									</NavigationMenuLink>
								</NavigationMenuItem>
							{/each}
						</NavigationMenuList>
					</NavigationMenuRoot>
				</PopoverContent>
			</Popover>

			<NavigationMenuRoot class="max-md:hidden">
				<NavigationMenuList class="gap-2">
					{#each navigationLinks as link (link.label)}
						<NavigationMenuItem>
							<NavigationMenuLink
								active={link.active}
								href={link.href}
								class="text-foreground hover:text-primary flex-row items-center gap-2 py-1.5 font-medium"
							>
								<link.icon size={16} class="text-muted-foreground/80" aria-hidden="true" />
								<span>{link.label}</span>
							</NavigationMenuLink>
						</NavigationMenuItem>
					{/each}
				</NavigationMenuList>
			</NavigationMenuRoot>
		</div>

		<!-- Middle side: Logo -->
		<div class="flex items-center">
			<a href="#" class="text-primary hover:text-primary/90">
				<Logo />
			</a>
		</div>

		<!-- Right side: Actions -->
		<div class="flex flex-1 items-center justify-end gap-4">
			<!-- User menu -->
			<UserMenu />
			<!-- Upgrade button -->
			<Button size="sm" class="aspect-square text-sm">
				<SparklesIcon class="opacity-60 max-sm:hidden sm:-ms-1" size={16} aria-hidden="true" />
				Upgrade
			</Button>
		</div>
	</div>
</header>
