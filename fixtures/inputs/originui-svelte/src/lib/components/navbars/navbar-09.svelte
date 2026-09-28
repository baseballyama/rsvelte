<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';

	import HashIcon from '@lucide/svelte/icons/hash';
	import HouseIcon from '@lucide/svelte/icons/house';
	import MailIcon from '@lucide/svelte/icons/mail';
	import SearchIcon from '@lucide/svelte/icons/search';
	import UsersRound from '@lucide/svelte/icons/users-round';
	import { Logo, NotificationMenu, UserMenu } from '$lib/components/_extras/navbars';
	import {
		NavigationMenuItem,
		NavigationMenuLink,
		NavigationMenuList,
		NavigationMenuRoot
	} from '$lib/components/ui/navigation-menu';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

	// Navigation links array to be used in both desktop and mobile menus
	const navigationLinks = [
		{ href: '#', icon: HouseIcon, label: 'Home' },
		{ href: '#', icon: HashIcon, label: 'Hash' },
		{ href: '#', icon: UsersRound, label: 'Groups' }
	];

	const id = $props.id();
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
			<div class="flex items-center gap-6">
				<a href="#" class="text-primary hover:text-primary/90">
					<Logo />
				</a>
				<!-- Search form -->
				<div class="relative">
					<Input {id} class="peer h-8 ps-8 pe-2" placeholder="Search..." type="search" />
					<div
						class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50"
					>
						<SearchIcon size={16} />
					</div>
				</div>
			</div>
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
			<div class="flex items-center gap-2">
				<!-- Messages -->
				<Button
					size="icon"
					variant="ghost"
					class="text-muted-foreground relative size-8 rounded-full shadow-none"
					aria-label="Open notifications"
				>
					<MailIcon size={16} aria-hidden="true" />
					<div
						aria-hidden="true"
						class="bg-primary absolute top-0.5 right-0.5 size-1 rounded-full"
					/>
				</Button>
				<!-- Notification menu -->
				<NotificationMenu />
			</div>
			<!-- User menu -->
			<UserMenu />
		</div>
	</div>
</header>
