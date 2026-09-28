<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import Rocket from '@lucide/svelte/icons/rocket';
	import X from '@lucide/svelte/icons/x';

	let visible = $state(true);
</script>

{#if visible}
	<div class="dark bg-muted text-foreground px-4 py-3">
		<div class="flex gap-2 md:items-center">
			<div class="flex grow gap-3 md:items-center">
				<div
					class="bg-primary/15 flex size-9 shrink-0 items-center justify-center rounded-full max-md:mt-0.5"
					aria-hidden="true"
				>
					<Rocket class="opacity-80" size={16} />
				</div>
				<div class="flex grow flex-col justify-between gap-3 md:flex-row md:items-center">
					<div class="space-y-0.5">
						<p class="text-sm font-medium">Boost your experience with Origin UI</p>
						<p class="text-muted-foreground text-sm">
							The new feature is live! Try it out and let us know what you think.
						</p>
					</div>
					<div class="flex gap-2 max-md:flex-wrap">
						<Button size="sm" class="text-sm">Try now</Button>
					</div>
				</div>
			</div>
			<Button
				variant="ghost"
				class="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
				onclick={() => (visible = false)}
				aria-label="Close banner"
			>
				<X
					size={16}
					class="opacity-60 transition-opacity group-hover:opacity-100"
					aria-hidden="true"
				/>
			</Button>
		</div>
	</div>
{/if}
