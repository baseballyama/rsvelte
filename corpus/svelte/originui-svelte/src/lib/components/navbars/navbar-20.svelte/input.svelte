<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Switch from '$lib/components/ui/switch.svelte';

	import ClockIcon from '@lucide/svelte/icons/clock';
	import PowerIcon from '@lucide/svelte/icons/power';
	import PowerOffIcon from '@lucide/svelte/icons/power-off';
	import ZapIcon from '@lucide/svelte/icons/zap';
	import {
		NavigationMenuItem,
		NavigationMenuLink,
		NavigationMenuList,
		NavigationMenuRoot
	} from '$lib/components/ui/navigation-menu';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

	// Navigation links array to be used in both desktop and mobile menus
	const navigationLinks = [
		{ active: true, href: '#', label: 'Overview' },
		{ href: '#', label: 'Graphs' },
		{ href: '#', label: 'Backups' }
	];

	let checked = $state(false);
	const id = $props.id();
</script>

<header class="border-b px-4 md:px-6">
	<div class="flex h-16 justify-between gap-4">
		<!-- Left side -->
		<div class="flex gap-2">
			<div class="flex items-center md:hidden">
				<!-- Mobile menu trigger -->
				<Popover>
					<PopoverTrigger>
						{#snippet child({ props })}
							<Button class="group size-8" variant="ghost" size="icon" {...props}>
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
			</div>
			<!-- Main nav -->
			<div class="flex items-center gap-6">
				<!-- Navigation menu -->
				<NavigationMenuRoot class="h-full *:h-full max-md:hidden">
					<NavigationMenuList class="h-full gap-2">
						{#each navigationLinks as link (link.label)}
							<NavigationMenuItem class="h-full">
								<NavigationMenuLink
									active={link.active}
									href={link.href}
									class="text-muted-foreground hover:border-b-primary hover:text-primary data-active:border-b-primary h-full  justify-center rounded-none border-y-2 border-transparent py-1.5 font-medium hover:bg-transparent data-active:bg-transparent!"
								>
									{link.label}
								</NavigationMenuLink>
							</NavigationMenuItem>
						{/each}
					</NavigationMenuList>
				</NavigationMenuRoot>
			</div>
		</div>
		<!-- Right side -->
		<div class="flex items-center gap-4">
			<div class="flex items-center gap-2">
				<Badge variant="outline" class="gap-1.5 text-emerald-600">
					<span class="size-1.5 rounded-full bg-emerald-500" aria-hidden="true"></span>
					Online
				</Badge>
				<Badge variant="outline" class="gap-1.5">
					<ZapIcon class="-ms-0.5 opacity-60" size={12} aria-hidden="true" />
					99.9%
				</Badge>
				<Badge variant="outline" class="gap-1.5">
					<ClockIcon class="-ms-0.5 opacity-60" size={12} aria-hidden="true" />
					45ms
				</Badge>
			</div>
			<!-- Switch -->
			<div>
				<div class="relative inline-grid h-7 grid-cols-[1fr_1fr] items-center text-sm font-medium">
					<Switch
						{id}
						{checked}
						onCheckedChange={(value) => (checked = value)}
						class="peer data-[state=unchecked]:bg-input/50 absolute inset-0 h-[inherit] w-auto [&_span]:z-10 [&_span]:h-full [&_span]:w-1/2 [&_span]:transition-transform [&_span]:duration-300 [&_span]:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] data-[state=checked]:[&_span]:translate-x-full rtl:data-[state=checked]:[&_span]:-translate-x-full"
					/>
					<span
						class="pointer-events-none relative ms-0.5 flex w-6 items-center justify-center text-center transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:invisible peer-data-[state=unchecked]:translate-x-full rtl:peer-data-[state=unchecked]:-translate-x-full"
					>
						<PowerOffIcon size={12} aria-hidden="true" />
					</span>
					<span
						class="peer-data-[state=checked]:text-background pointer-events-none relative me-0.5 flex w-6 items-center justify-center text-center transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:-translate-x-full peer-data-[state=unchecked]:invisible rtl:peer-data-[state=checked]:translate-x-full"
					>
						<PowerIcon size={12} aria-hidden="true" />
					</span>
				</div>
				<Label for={id} class="sr-only">Power</Label>
			</div>
		</div>
	</div>
</header>
