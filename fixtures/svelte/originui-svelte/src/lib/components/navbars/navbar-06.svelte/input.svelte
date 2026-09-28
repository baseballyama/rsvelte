<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import HomeIcon from '@lucide/svelte/icons/home';
	import LayersIcon from '@lucide/svelte/icons/layers';
	import UsersIcon from '@lucide/svelte/icons/users';
	import { Logo, ThemeToggle, UserMenu } from '$lib/components/_extras/navbars';
	import {
		NavigationMenuItem,
		NavigationMenuLink,
		NavigationMenuList,
		NavigationMenuRoot
	} from '$lib/components/ui/navigation-menu';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import {
		Tooltip,
		TooltipContent,
		TooltipProvider,
		TooltipTrigger
	} from '$lib/components/ui/tooltip';

	// Navigation links with icons for desktop icon-only navigation
	const navigationLinks = [
		{ active: true, href: '#', icon: HomeIcon, label: 'Dashboard' },
		{ href: '#', icon: LayersIcon, label: 'Projects' },
		{ href: '#', icon: FileTextIcon, label: 'Documentation' },
		{ href: '#', icon: UsersIcon, label: 'Team' }
	];

	// Language options
	const languages = [
		{ label: 'De', value: 'de' },
		{ label: 'En', value: 'en' },
		{ label: 'Es', value: 'es' },
		{ label: 'Fr', value: 'fr' },
		{ label: 'Ja', value: 'ja' }
	];
	let selectedLanguage = $state(languages[0].value);
	const id = $props.id();
</script>

<header class="border-b px-4 md:px-6">
	<div class="flex h-16 items-center justify-between gap-4">
		<!-- Left side  -->
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
				<!-- Logo  -->
				<a href="#" class="text-primary hover:text-primary/90">
					<Logo />
				</a>
				<!-- Desktop navigation - icon only -->
				<NavigationMenuRoot class="hidden md:flex">
					<NavigationMenuList class="gap-2">
						<TooltipProvider>
							{#each navigationLinks as link (link.label)}
								<NavigationMenuItem>
									<Tooltip>
										<TooltipTrigger>
											{#snippet child({ props })}
												<NavigationMenuLink
													href={link.href}
													class="flex size-8 items-center justify-center p-1.5"
													{...props}
												>
													<link.icon size={20} aria-hidden="true" />
													<span class="sr-only">{link.label}</span>
												</NavigationMenuLink>
											{/snippet}
										</TooltipTrigger>
										<TooltipContent side="bottom" class="px-2 py-1 text-xs">
											<p>{link.label}</p>
										</TooltipContent>
									</Tooltip>
								</NavigationMenuItem>
							{/each}
						</TooltipProvider>
					</NavigationMenuList>
				</NavigationMenuRoot>
			</div>
		</div>
		<!-- Right side -->
		<div class="flex items-center gap-2">
			<!-- Theme toggle -->
			<ThemeToggle />
			<!-- Language selector -->
			<Select type="single" onValueChange={(v) => (selectedLanguage = v)} items={languages}>
				<SelectTrigger
					id="language-{id}"
					class="hover:bg-accent hover:text-accent-foreground h-8 border-none px-2 shadow-none "
					aria-label="Select language"
				>
					<div class="[&>svg]:text-muted-foreground/80 flex items-center gap-2 [&>svg]:shrink-0">
						<GlobeIcon size={16} aria-hidden="true" />
						<span class="text-foreground hidden truncate sm:inline-flex">
							{#if selectedLanguage}
								{languages.find((lang) => lang.value === selectedLanguage)!.label}
							{/if}
						</span>
					</div>
				</SelectTrigger>
				<SelectContent
					class="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2"
				>
					{#each languages as lang (lang)}
						<SelectItem value={lang.value}>
							<span class="flex items-center gap-2">
								<span class="truncate">{lang.label}</span>
							</span>
						</SelectItem>
					{/each}
				</SelectContent>
			</Select>
			<!-- User menu -->
			<UserMenu />
		</div>
	</div>
</header>
