<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Switch from '$lib/components/ui/switch.svelte';

	import IconMoon from '@lucide/svelte/icons/moon';
	import IconSun from '@lucide/svelte/icons/sun';

	const uid = $props.id();
</script>

<div>
	<div class="relative inline-grid h-9 grid-cols-[1fr_1fr] items-center text-sm font-medium">
		<Switch
			id={uid}
			checked={false}
			class="peer data-[state=checked]:bg-input/50 data-[state=unchecked]:bg-input/50 absolute inset-0 h-[inherit] w-auto [&_span]:h-full [&_span]:w-1/2 [&_span]:transition-transform [&_span]:duration-300 [&_span]:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] [&_span]:data-[state=checked]:translate-x-full [&_span]:data-[state=checked]:rtl:-translate-x-full"
		/>
		<span
			class="peer-data-[state=checked]:text-muted-foreground/70 pointer-events-none relative ms-0.5 flex min-w-8 items-center justify-center text-center"
		>
			<IconMoon size={16} aria-hidden="true" />
		</span>
		<span
			class="peer-data-[state=unchecked]:text-muted-foreground/70 pointer-events-none relative me-0.5 flex min-w-8 items-center justify-center text-center"
		>
			<IconSun size={16} aria-hidden="true" />
		</span>
	</div>
	<Label for={uid} class="sr-only">Labeled switch</Label>
</div>
