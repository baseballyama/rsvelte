<script lang="ts">
	import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';

	import * as Dialog from '$lib/components/ui/dialog';
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>Sign up</Dialog.Trigger>
	<Dialog.Content>
		<div class="flex flex-col items-center gap-2">
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
				<Dialog.Title class="sm:text-center">Sign up Origin UI</Dialog.Title>
				<Dialog.Description class="sm:text-center">
					We just need a few details to get you started.
				</Dialog.Description>
			</Dialog.Header>
		</div>

		<form class="space-y-5">
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="signup-name">Full name</Label>
					<Input id="signup-name" placeholder="Matt Welsh" type="text" required />
				</div>
				<div class="space-y-2">
					<Label for="signup-email">Email</Label>
					<Input id="signup-email" placeholder="hi@yourcompany.com" type="email" required />
				</div>
				<div class="space-y-2">
					<Label for="signup-password">Password</Label>
					<Input id="signup-password" placeholder="Enter your password" type="password" required />
				</div>
			</div>
			<Button type="button" class="w-full">Sign up</Button>
		</form>

		<div
			class="before:bg-border after:bg-border flex items-center gap-3 before:h-px before:flex-1 after:h-px after:flex-1"
		>
			<span class="text-muted-foreground text-xs">Or</span>
		</div>

		<Button variant="outline">Continue with Google</Button>

		<p class="text-muted-foreground text-center text-xs">
			By signing up you agree to our
			<a class="underline hover:no-underline" href="#title">Terms</a>.
		</p>
	</Dialog.Content>
</Dialog.Root>
