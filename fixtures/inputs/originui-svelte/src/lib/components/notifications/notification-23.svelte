<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
</script>

<!-- To make the notification fixed, add classes like `fixed bottom-4 inset-x-4` to the container element. -->
<div class="border-border bg-background z-100 rounded-lg border px-4 py-3 shadow-lg shadow-black/5">
	<div class="flex flex-col justify-between gap-3 md:flex-row md:items-center">
		<p class="text-sm">
			We use cookies to improve your experience, analyze site usage, and show personalized content.
		</p>
		<div class="flex gap-2 max-md:flex-wrap">
			<Button size="sm">Accept</Button>
			<Button variant="outline" size="sm">Decline</Button>
		</div>
	</div>
</div>
