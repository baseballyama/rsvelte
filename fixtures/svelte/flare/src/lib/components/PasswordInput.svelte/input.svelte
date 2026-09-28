<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Eye, EyeOff } from '@lucide/svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = {
		value?: string | undefined | null;
	} & HTMLInputAttributes;

	let { value = $bindable(), ...restProps }: Props = $props();
	let showPassword = $state(false);
	const inputType = $derived(showPassword ? 'text' : 'password');
</script>

<div class="relative">
	<Input {...restProps} bind:value type={inputType} files={undefined} class="pr-10" />
	<Button
		type="button"
		variant="ghost"
		size="sm"
		class="absolute top-1/2 right-0 h-full w-10 -translate-y-1/2 rounded-lg"
		onclick={() => (showPassword = !showPassword)}
		aria-label={showPassword ? 'Hide password' : 'Show password'}
	>
		{#if showPassword}
			<EyeOff class="size-4" />
		{:else}
			<Eye class="size-4" />
		{/if}
	</Button>
</div>
