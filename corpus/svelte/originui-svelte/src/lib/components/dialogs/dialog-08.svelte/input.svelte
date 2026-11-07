<script lang="ts">
	import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';

	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import * as Dialog from '$lib/components/ui/dialog';
	import { PROJECT_NAME } from '$lib/config';

	let inputValue = $state('');
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>Delete project</Dialog.Trigger>
	<Dialog.Content>
		<div class="flex flex-col items-center gap-2">
			<div
				class="border-border flex size-9 shrink-0 items-center justify-center rounded-full border"
				aria-hidden="true"
			>
				<CircleAlert class="opacity-80" size={16} />
			</div>
			<Dialog.Header>
				<Dialog.Title class="sm:text-center">Final confirmation</Dialog.Title>
				<Dialog.Description class="sm:text-center">
					This action cannot be undone. To confirm, please enter the project name
					<span class="text-foreground">{PROJECT_NAME}</span>.
				</Dialog.Description>
			</Dialog.Header>
		</div>

		<form class="space-y-5">
			<div class="space-y-2">
				<Label for="project-name">Project name</Label>
				<Input
					id="project-name"
					type="text"
					placeholder="Type {PROJECT_NAME} to confirm"
					bind:value={inputValue}
				/>
			</div>
			<Dialog.Footer>
				<Dialog.Close class="{buttonVariants({ variant: 'outline' })} flex-1">Cancel</Dialog.Close>
				<Button type="button" class="flex-1" disabled={inputValue !== PROJECT_NAME}>Delete</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
