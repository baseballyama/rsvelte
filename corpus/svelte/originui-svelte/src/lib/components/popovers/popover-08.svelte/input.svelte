<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';

	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
</script>

<div class="flex flex-col gap-4">
	<Popover>
		<PopoverTrigger>
			{#snippet child({ props })}
				<Button variant="outline" {...props}>Feedback</Button>
			{/snippet}
		</PopoverTrigger>
		<PopoverContent class="w-72">
			<h2 class="mb-2 text-sm font-semibold">Send us feedback</h2>
			<form class="space-y-3">
				<Textarea
					id="feedback"
					placeholder="How can we improve Origin UI?"
					aria-label="Send feedback"
				/>
				<div class="flex flex-col sm:flex-row sm:justify-end">
					<Button size="sm">Send feedback</Button>
				</div>
			</form>
		</PopoverContent>
	</Popover>
</div>
