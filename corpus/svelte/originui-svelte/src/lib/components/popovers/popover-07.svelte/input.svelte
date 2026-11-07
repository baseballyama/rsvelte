<script lang="ts">
	import Input from '../ui/input.svelte';
	import Button from '$lib/components/ui/button.svelte';

	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import RiCodeFill from '~icons/ri/code-fill';
	import RiFacebookFill from '~icons/ri/facebook-fill';
	import RiMailLine from '~icons/ri/mail-line';
	import RiTwitterXFill from '~icons/ri/twitter-x-fill';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
	import {
		Tooltip,
		TooltipContent,
		TooltipProvider,
		TooltipTrigger
	} from '$lib/components/ui/tooltip';
	import { cn } from '$lib/utils';

	let copied = $state(false);
	let inputRef = $state<HTMLInputElement | null>(null);

	function handleCopy() {
		if (!inputRef) return;

		navigator.clipboard.writeText(inputRef.value);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<div class="flex flex-col gap-4">
	<Popover>
		<PopoverTrigger>
			{#snippet child({ props })}
				<Button variant="outline" {...props}>Share</Button>
			{/snippet}
		</PopoverTrigger>
		<PopoverContent class="w-72">
			<div class="flex flex-col gap-3 text-center">
				<div class="text-sm font-medium">Share code</div>
				<div class="flex flex-wrap justify-center gap-2">
					<Button size="icon" variant="outline" aria-label="Embed">
						<RiCodeFill class="size-4" aria-hidden="true" />
					</Button>
					<Button size="icon" variant="outline" aria-label="Share on Twitter">
						<RiTwitterXFill class="size-4" aria-hidden="true" />
					</Button>
					<Button size="icon" variant="outline" aria-label="Share on Facebook">
						<RiFacebookFill class="size-4" aria-hidden="true" />
					</Button>
					<Button size="icon" variant="outline" aria-label="Share via email">
						<RiMailLine class="size-4" aria-hidden="true" />
					</Button>
				</div>
				<div class="space-y-2">
					<div class="relative">
						<Input
							bind:ref={inputRef}
							id="input-53"
							class="pe-9"
							type="text"
							value="https://originui-svelte.pages.dev/"
							aria-label="Share link"
							readonly
						/>
						<TooltipProvider delayDuration={0}>
							<Tooltip>
								<TooltipTrigger>
									{#snippet child()}
										<button
											onclick={handleCopy}
											class="text-muted-foreground/80 hover:text-foreground focus-visible:text-foreground focus-visible:outline-ring/70 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg border border-transparent outline-offset-2 transition-colors focus-visible:outline-2 focus-visible:outline-solid disabled:pointer-events-none disabled:cursor-not-allowed"
											aria-label={copied ? 'Copied' : 'Copy to clipboard'}
											disabled={copied}
										>
											<div
												class={cn(
													'transition-all',
													copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
												)}
											>
												<Check class="stroke-emerald-500" size={16} aria-hidden="true" />
											</div>
											<div
												class={cn(
													'absolute transition-all',
													copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
												)}
											>
												<Copy size={16} aria-hidden="true" />
											</div>
										</button>
									{/snippet}
								</TooltipTrigger>
								<TooltipContent class="px-2 py-1 text-xs">Copy to clipboard</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</div>
			</div>
		</PopoverContent>
	</Popover>
</div>
