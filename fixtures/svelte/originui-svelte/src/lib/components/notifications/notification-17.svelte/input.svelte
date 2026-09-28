<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import X from '@lucide/svelte/icons/x';
	import Avatar from '$assets/avatar-32-01.jpg';
</script>

<!-- To make the notification fixed, add classes like `fixed bottom-4 right-4` to the container element. -->
<div
	class="border-border bg-background z-100 max-w-[400px] rounded-lg border p-4 shadow-lg shadow-black/5"
>
	<div class="flex gap-3">
		<img class="size-9 rounded-full" src={Avatar} width={32} height={32} alt="Mary Palmer" />
		<div class="flex grow flex-col gap-3">
			<div class="space-y-1">
				<p class="text-muted-foreground text-sm">
					<a class="text-foreground font-medium hover:underline" href="#title"> Mary Palmer </a>
					mentioned you in
					<a class="text-foreground font-medium hover:underline" href="#title">
						project-campaign-02
					</a>.
				</p>
				<p class="text-muted-foreground text-xs">2 min ago</p>
			</div>
			<div class="flex gap-2">
				<Button size="sm">Accept</Button>
				<Button size="sm" variant="outline">Decline</Button>
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
