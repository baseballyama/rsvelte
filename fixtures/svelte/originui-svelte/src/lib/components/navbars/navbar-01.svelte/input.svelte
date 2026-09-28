<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import { Logo } from '$lib/components/_extras/navbars';
	import {
		NavigationMenuItem,
		NavigationMenuLink,
		NavigationMenuList,
		NavigationMenuRoot
	} from '$lib/components/ui/navigation-menu';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

	// Navigation links array to be used in both desktop and mobile menus
	const navigationLinks = [
		{ active: true, href: '#', label: 'Home' },
		{ href: '#', label: 'Features' },
		{ href: '#', label: 'Pricing' },
		{ href: '#', label: 'About' }
	];
</script>

<header class="border-b px-4 md:px-6">
	<div class="flex h-16 items-center justify-between gap-4">
		<!-- Left side  -->
		<div class="flex items-center gap-2">
			<!-- Mobile menu trigger  -->
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
									<NavigationMenuLink href={link.href} class="py-1.5" active={link.active}>
										{link.label}
									</NavigationMenuLink>
								</NavigationMenuItem>
							{/each}
						</NavigationMenuList>
					</NavigationMenuRoot>
				</PopoverContent>
			</Popover>
			<!-- Main nav  -->
			<div class="flex items-center gap-6">
				<a href="#" class="text-primary hover:text-primary/90">
					<Logo />
				</a>
				<!-- Navigation menu  -->
				<NavigationMenuRoot class="max-md:hidden">
					<NavigationMenuList class="gap-2">
						{#each navigationLinks as link (link.label)}
							<NavigationMenuItem>
								<NavigationMenuLink
									active={link.active}
									href={link.href}
									class="text-muted-foreground hover:text-primary py-1.5 font-medium"
								>
									{link.label}
								</NavigationMenuLink>
							</NavigationMenuItem>
						{/each}
					</NavigationMenuList>
				</NavigationMenuRoot>
			</div>
		</div>
		<!-- Right side  -->
		<div class="flex items-center gap-2">
			<Button href="#" variant="ghost" size="sm" class="text-sm">Sign In</Button>
			<Button href="#" size="sm" class="text-sm">Get Started</Button>
		</div>
	</div>
</header>
