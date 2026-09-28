<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import InfoIcon from '@lucide/svelte/icons/info';
	import LifeBuoyIcon from '@lucide/svelte/icons/life-buoy';
	import { Logo } from '$lib/components/_extras/navbars';
	import {
		NavigationMenuContent,
		NavigationMenuItem,
		NavigationMenuLink,
		NavigationMenuList,
		NavigationMenuRoot,
		NavigationMenuTrigger
	} from '$lib/components/ui/navigation-menu';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';

	// Navigation links array to be used in both desktop and mobile menus
	const navigationLinks = [
		{ href: '#', label: 'Home' },
		{
			items: [
				{
					description: 'Browse all components in the library.',
					href: '#',
					label: 'Components'
				},
				{
					description: 'Learn how to use the library.',
					href: '#',
					label: 'Documentation'
				},
				{
					description: 'Pre-built layouts for common use cases.',
					href: '#',
					label: 'Templates'
				}
			],
			label: 'Features',
			submenu: true,
			type: 'description'
		},
		{
			items: [
				{ href: '#', label: 'Product A' },
				{ href: '#', label: 'Product B' },
				{ href: '#', label: 'Product C' },
				{ href: '#', label: 'Product D' }
			],
			label: 'Pricing',
			submenu: true,
			type: 'simple'
		},
		{
			items: [
				{ href: '#', icon: BookOpenIcon, label: 'Getting Started' },
				{ href: '#', icon: LifeBuoyIcon, label: 'Tutorials' },
				{ href: '#', icon: InfoIcon, label: 'About Us' }
			],
			label: 'About',
			submenu: true,
			type: 'icon'
		}
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
				<PopoverContent align="start" class="z-10 w-64 p-1 md:hidden">
					<NavigationMenuRoot class="max-w-none *:w-full">
						<NavigationMenuList class="flex-col items-start gap-0 md:gap-2">
							{#each navigationLinks as link, index (link.label)}
								<NavigationMenuItem class="w-full">
									{#if link.submenu}
										<div class="text-muted-foreground px-2 py-1.5 text-xs font-medium">
											{link.label}
										</div>
										<ul>
											{#each link.items as item (item.label)}
												<li>
													<NavigationMenuLink href={item.href} class="py-1.5">
														{item.label}
													</NavigationMenuLink>
												</li>
											{/each}
										</ul>
									{:else}
										<NavigationMenuLink href={link.href} class="py-1.5">
											{link.label}
										</NavigationMenuLink>
									{/if}

									<!-- Add separator between different types of items -->
									{#if index < navigationLinks.length - 1}
										<!-- Show separator if: -->
										<!-- 1. One is submenu and one is simple link OR -->
										<!-- 2. Both are submenus but with different types  -->
										{#if (!link.submenu && navigationLinks[index + 1].submenu) || (link.submenu && !navigationLinks[index + 1].submenu) || (link.submenu && navigationLinks[index + 1].submenu && link.type !== navigationLinks[index + 1].type)}
											<div
												role="separator"
												aria-orientation="horizontal"
												class="bg-border -mx-1 my-1 h-px w-full"
											/>
										{/if}
									{/if}
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
				<NavigationMenuRoot class="max-md:hidden" viewport={false}>
					<NavigationMenuList class="gap-2">
						{#each navigationLinks as link (link.label)}
							<NavigationMenuItem>
								{#if link.submenu}
									<NavigationMenuTrigger
										class="text-muted-foreground hover:text-primary bg-transparent px-2 py-1.5 font-medium [&_svg]:-me-0.5 [&_svg]:size-3.5"
									>
										{link.label}
									</NavigationMenuTrigger>
									<NavigationMenuContent
										class="data-[motion=from-end]:slide-in-from-right-16! data-[motion=from-start]:slide-in-from-left-16! data-[motion=to-end]:slide-out-to-right-16! data-[motion=to-start]:slide-out-to-left-16! z-50 p-1"
									>
										<ul class={cn(link.type === 'description' ? 'min-w-64' : 'min-w-48')}>
											{#each link.items as item (item.label)}
												<li>
													<NavigationMenuLink href={item.href} class="py-1.5">
														<!-- Display icon if present -->
														{#if link.type === 'icon' && 'icon' in item}
															<div class="flex items-center gap-2">
																<item.icon
																	size={16}
																	class="text-foreground opacity-60"
																	aria-hidden="true"
																/>
																<span>{item.label}</span>
															</div>
														{/if}

														<!-- Display label with description if present -->
														{#if link.type === 'description' && 'description' in item}
															<div class="space-y-1">
																<div class="font-medium">
																	{item.label}
																</div>
																<p class="text-muted-foreground line-clamp-2 text-xs">
																	{item.description}
																</p>
															</div>
														{:else if !link.type || (link.type !== 'icon' && link.type !== 'description')}
															<span>{item.label}</span>
														{/if}
													</NavigationMenuLink>
												</li>
											{/each}
										</ul>
									</NavigationMenuContent>
								{:else}
									<NavigationMenuLink
										href={link.href}
										class="text-muted-foreground hover:text-primary py-1.5 font-medium"
									>
										{link.label}
									</NavigationMenuLink>
								{/if}
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
