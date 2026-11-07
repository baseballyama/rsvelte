<script lang="ts">
	import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';

	import Mail from '@lucide/svelte/icons/mail';
	import * as Dialog from '$lib/components/ui/dialog';
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>Newsletter</Dialog.Trigger>
	<Dialog.Content>
		<div class="mb-2 flex flex-col items-center gap-2">
			<div
				class="border-border flex size-11 shrink-0 items-center justify-center rounded-full border"
				aria-hidden="true"
			>
				<svg
					class="stroke-svelte size-6"
					xmlns="http://www.w3.org/2000/svg"
					width="28"
					height="28"
					viewBox="0 0 32 32"
					aria-hidden="true"
				>
					<circle cx="16" cy="16" r="13" fill="none" stroke-width="2" />
					<circle cx="16" cy="16" r="9" fill="none" stroke-width="2" />
				</svg>
			</div>
			<Dialog.Header>
				<Dialog.Title class="sm:text-center">Never miss an update</Dialog.Title>
				<Dialog.Description class="sm:text-center">
					Subscribe to receive news and special offers.
				</Dialog.Description>
			</Dialog.Header>
		</div>

		<form class="space-y-5">
			<div class="space-y-2">
				<div class="relative">
					<Input
						id="dialog.-subscribe"
						class="peer ps-9"
						placeholder="hi@yourcompany.com"
						type="email"
						aria-label="Email"
					/>
					<div
						class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50"
					>
						<Mail size={16} aria-hidden="true" />
					</div>
				</div>
			</div>
			<Button type="button" class="w-full">Subscribe</Button>
		</form>

		<p class="text-muted-foreground text-center text-xs">
			By subscribing you agree to our
			<a class="underline hover:no-underline" href="#title">Privacy Policy</a>.
		</p>
	</Dialog.Content>
</Dialog.Root>
