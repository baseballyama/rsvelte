<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import X from '@lucide/svelte/icons/x';
</script>

<!-- To make the notification fixed, add classes like `fixed bottom-4 right-4` to the container element. -->
<div
	class="border-border bg-background z-100 max-w-[400px] rounded-lg border px-4 py-3 shadow-lg shadow-black/5"
>
	<div class="flex gap-2">
		<div class="flex grow gap-3">
			<CircleCheck class="mt-0.5 shrink-0 text-emerald-500" size={16} aria-hidden="true" />
			<div class="flex grow justify-between gap-12">
				<p class="text-sm">Completed successfully!</p>
				<a href="#title" class="group text-sm font-medium whitespace-nowrap">
					Link<ArrowRight
						class="ms-1 -mt-0.5 inline-flex opacity-60 transition-transform group-hover:translate-x-0.5"
						size={16}
						aria-hidden="true"
					/>
				</a>
			</div>
		</div>
		<Button
			variant="ghost"
			class="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
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
