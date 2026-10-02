<script lang="ts">
	import { Input, type InputProps } from '$lib/components/ui/input';
	import { cn } from '$lib/utils';

	let {
		value = $bindable(),
		ref = $bindable(null),
		class: className,
		...rest
	}: InputProps = $props();
</script>

<Input
	type="text"
	class={cn(
		'h-15 w-full rounded-none border-none !bg-transparent px-4 pr-0 !text-lg shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
		className
	)}
	bind:ref
	bind:value
	{...rest}
	onkeydown={(e) => {
		if (e.key === 'Escape' && value) {
			e.preventDefault();
			value = '';
		}

		rest.onkeydown?.(e);
	}}
/>
