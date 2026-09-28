<script lang="ts">
	import { DateField, type WithChildren } from 'bits-ui';

	let {
		children,
		class: className,
		...restProps
	}: WithChildren<DateField.RootProps> & { class?: string } = $props();
</script>

<DateField.Root {...restProps}>
	<div class={className}>
		{@render children?.()}
	</div>
</DateField.Root>
