<script lang="ts">
	import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';

	import * as Dialog from '$lib/components/ui/dialog';
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>Feedback</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Send us feedback</Dialog.Title>
			<Dialog.Description>
				Watch
				<a class="text-foreground hover:underline" href="#title">tutorials</a>, read Origin
				UI&lsquo;s
				<a class="text-foreground hover:underline" href="#title">documentation</a>, or join our
				<a class="text-foreground hover:underline" href="#title">Discord</a>
				for community help.
			</Dialog.Description>
		</Dialog.Header>
		<form class="space-y-5">
			<Textarea
				id="feedback"
				placeholder="How can we improve Origin UI?"
				aria-label="Send feedback"
			/>
			<div class="flex flex-col sm:flex-row sm:justify-end">
				<Button type="button">Send feedback</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
