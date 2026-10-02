<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import X from '@lucide/svelte/icons/x';
	import { toast, type ToastT } from 'svelte-sonner';

	function openToast() {
		const newId = Math.random();
		//the implementation will change, once https://github.com/wobsoriano/svelte-sonner/pull/126 lands
		//@ts-expect-error - this is a hack to get the toast id, dont use in production
		toast.custom((node) => customToastSnippet(node, () => newId), {
			id: newId
		});
	}
</script>

{#snippet customToastSnippet(toastId: ToastT['id'])}
	<div class="border-border bg-background w-(--width) rounded-lg border px-4 py-3">
		<div class="flex gap-2">
			<div class="flex grow gap-3">
				<CircleCheck class="mt-0.5 shrink-0 text-emerald-500" size={16} aria-hidden="true" />

				<div class="flex grow justify-between gap-12">
					<p class="text-sm">Message sent</p>
					<div class="text-sm whitespace-nowrap">
						<button class="text-sm font-medium hover:underline">View</button>
						<span class="text-muted-foreground mx-1">·</span>
						<button
							class="text-sm font-medium hover:underline"
							onclick={() => toast.dismiss(toastId)}
						>
							Undo
						</button>
					</div>
				</div>
			</div>
			<Button
				variant="ghost"
				class="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
				aria-label="Close banner"
				onclick={() => toast.dismiss(toastId)}
			>
				<X
					size={16}
					class="opacity-60 transition-opacity group-hover:opacity-100"
					aria-hidden="true"
				/>
			</Button>
		</div>
	</div>
{/snippet}

<Button variant="outline" onclick={() => openToast()}>Custom sonner</Button>
