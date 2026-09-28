<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';

	import MicIcon from '@lucide/svelte/icons/mic';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { Logo, ThemeToggle } from '$lib/components/_extras/navbars';

	const id = $props.id();
</script>

<header class="border-b px-4 md:px-6">
	<div class="flex h-16 items-center justify-between gap-4">
		<!-- Logo -->
		<div class="flex-1">
			<a href="#" class="text-primary hover:text-primary/90">
				<Logo />
			</a>
		</div>
		<!-- Middle area -->
		<div class="grow max-sm:hidden">
			<!-- Search form -->
			<div class="relative mx-auto w-full max-w-xs">
				<Input {id} class="peer h-8 px-8" placeholder="Search..." type="search" />
				<div
					class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50"
				>
					<SearchIcon size={16} />
				</div>
				<button
					class="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md outline-hidden transition-[color,box-shadow] focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
					aria-label="Press to speak"
					type="submit"
				>
					<MicIcon size={16} aria-hidden="true" />
				</button>
			</div>
		</div>
		<!-- Right side -->
		<div class="flex flex-1 items-center justify-end gap-2">
			<Button variant="ghost" href="#" size="sm" class="text-sm">Community</Button>
			<Button size="sm" href="#" class="text-sm">Get Started</Button>
			<ThemeToggle />
		</div>
	</div>
</header>
