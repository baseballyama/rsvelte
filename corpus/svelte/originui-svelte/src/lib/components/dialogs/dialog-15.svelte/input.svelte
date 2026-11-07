<script lang="ts">
	import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import {
		Tooltip,
		TooltipContent,
		TooltipProvider,
		TooltipTrigger
	} from '$lib/components/ui/tooltip/index.js';

	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import UserRoundPlus from '@lucide/svelte/icons/user-round-plus';
	import * as Dialog from '$lib/components/ui/dialog';
	import { cn } from '$lib/utils';

	let input = $state<HTMLInputElement | null>(null);
	let emails = $state(['mark@yourcompany.com', 'jane@yourcompany.com', '']);
	let copied = $state(false);

	function addEmail() {
		emails.push('');
	}

	function handleCopy() {
		navigator.clipboard.writeText(input!.value);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>Invite members</Dialog.Trigger>
	<Dialog.Content>
		<div class="flex flex-col gap-2">
			<div
				class="border-border flex size-11 shrink-0 items-center justify-center rounded-full border"
				aria-hidden="true"
			>
				<UserRoundPlus class="opacity-80" size={16} />
			</div>
			<Dialog.Header>
				<Dialog.Title class="text-left">Invite team members</Dialog.Title>
				<Dialog.Description class="text-left">
					Invite teammates to earn free components.
				</Dialog.Description>
			</Dialog.Header>
		</div>

		<form class="space-y-5">
			<div class="space-y-4">
				<div class="space-y-2">
					<Label>Invite via email</Label>
					<div class="space-y-3">
						{#each emails as _, index (index)}
							<Input
								id={`team-email-${index + 1}`}
								placeholder="hi@yourcompany.com"
								type="email"
								bind:value={emails[index]}
							/>
						{/each}
					</div>
				</div>
				<button type="button" onclick={addEmail} class="text-sm underline hover:no-underline">
					+ Add another
				</button>
			</div>
			<Button type="button" class="w-full">Send invites</Button>
		</form>

		<hr class="border-border my-1 border-t" />

		<div class="space-y-2">
			<Label for="input-53">Invite via magic link</Label>
			<div class="relative">
				<Input
					bind:ref={input}
					id="input-53"
					class="pe-9"
					type="text"
					value="https://originui.com/refer/87689"
					readonly
				/>
				<TooltipProvider delayDuration={0}>
					<Tooltip>
						<TooltipTrigger>
							{#snippet child({ props })}
								<button
									{...props}
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
	</Dialog.Content>
</Dialog.Root>
