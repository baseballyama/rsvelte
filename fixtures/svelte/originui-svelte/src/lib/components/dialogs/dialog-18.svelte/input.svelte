<script lang="ts">
	import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

	import Check from '@lucide/svelte/icons/check';
	import RefreshCcw from '@lucide/svelte/icons/refresh-ccw';
	import * as Dialog from '$lib/components/ui/dialog';
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>Change plan</Dialog.Trigger>
	<Dialog.Content>
		<div class="mb-2 flex flex-col gap-2">
			<div
				class="border-border flex size-11 shrink-0 items-center justify-center rounded-full border"
				aria-hidden="true"
			>
				<RefreshCcw class="opacity-80" size={16} />
			</div>
			<Dialog.Header>
				<Dialog.Title class="text-left">Change your plan</Dialog.Title>
				<Dialog.Description class="text-left">Pick one of the following plans.</Dialog.Description>
			</Dialog.Header>
		</div>

		<form class="space-y-5">
			<RadioGroup class="gap-2" value="plan-02">
				<div
					class="border-input has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent relative flex w-full items-center gap-2 rounded-lg border px-4 py-3 shadow-xs shadow-black/5"
				>
					<RadioGroupItem
						value="plan-01"
						id="plan-01"
						aria-describedby="plan-01-description"
						class="order-1 after:absolute after:inset-0"
					/>
					<div class="grid grow gap-1">
						<Label for="plan-01">Essential</Label>
						<p id="plan-01-description" class="text-muted-foreground text-xs">
							$4 per member/month
						</p>
					</div>
				</div>
				<div
					class="border-input has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent relative flex w-full items-center gap-2 rounded-lg border px-4 py-3 shadow-xs shadow-black/5"
				>
					<RadioGroupItem
						value="plan-02"
						id="plan-02"
						aria-describedby="plan-02-description"
						class="order-1 after:absolute after:inset-0"
					/>
					<div class="grid grow gap-1">
						<Label for="plan-02">Standard</Label>
						<p id="plan-02-description" class="text-muted-foreground text-xs">
							$19 per member/month
						</p>
					</div>
				</div>
				<div
					class="border-input has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent relative flex w-full items-center gap-2 rounded-lg border px-4 py-3 shadow-xs shadow-black/5"
				>
					<RadioGroupItem
						value="plan-03"
						id="plan-03"
						aria-describedby="plan-03-description"
						class="order-1 after:absolute after:inset-0"
					/>
					<div class="grid grow gap-1">
						<Label for="plan-03">Enterprise</Label>
						<p id="plan-03-description" class="text-muted-foreground text-xs">
							$32 per member/month
						</p>
					</div>
				</div>
			</RadioGroup>

			<div class="space-y-3">
				<p>
					<strong class="text-sm font-medium">Features include:</strong>
				</p>
				<ul class="text-muted-foreground space-y-2 text-sm">
					<li class="flex gap-2">
						<Check size={16} class="text-primary mt-0.5 shrink-0" aria-hidden="true" />
						Create unlimited projects.
					</li>
					<li class="flex gap-2">
						<Check size={16} class="text-primary mt-0.5 shrink-0" aria-hidden="true" />
						Remove watermarks.
					</li>
					<li class="flex gap-2">
						<Check size={16} class="text-primary mt-0.5 shrink-0" aria-hidden="true" />
						Add unlimited users and free viewers.
					</li>
					<li class="flex gap-2">
						<Check size={16} class="text-primary mt-0.5 shrink-0" aria-hidden="true" />
						Upload unlimited files.
					</li>
					<li class="flex gap-2">
						<Check size={16} class="text-primary mt-0.5 shrink-0" aria-hidden="true" />
						7-day money back guarantee.
					</li>
					<li class="flex gap-2">
						<Check size={16} class="text-primary mt-0.5 shrink-0" aria-hidden="true" />
						Advanced permissions.
					</li>
				</ul>
			</div>

			<div class="grid gap-2">
				<Button type="button" class="w-full">Change plan</Button>
				<Dialog.Close class="{buttonVariants({ variant: 'ghost' })} w-full">Cancel</Dialog.Close>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
