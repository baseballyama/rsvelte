<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import X from '@lucide/svelte/icons/x';
</script>

<!-- To make the notification fixed, add classes like `fixed bottom-4 right-4` to the container element. -->
<div
	class="border-border bg-background z-100 max-w-[400px] rounded-lg border p-4 shadow-lg shadow-black/5"
>
	<div class="flex gap-2">
		<div class="flex grow gap-3">
			<TriangleAlert class="mt-0.5 shrink-0 text-amber-500" size={16} aria-hidden="true" />
			<div class="flex grow flex-col gap-3">
				<div class="space-y-1">
					<p class="text-sm font-medium">Something requires your action!</p>
					<p class="text-muted-foreground text-sm">
						It conveys that a specific action is needed to resolve or address a situation.
					</p>
				</div>
				<div>
					<Button size="sm">Learn more</Button>
				</div>
			</div>
		</div>
		<Button
			variant="ghost"
			class="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
			aria-label="Close notification"
		>
			<X
				size={16}
				class="opacity-60 transition-opacity group-hover:opacity-100"
				aria-hidden="true"
			/>
		</Button>
	</div>
</div>
