<script lang="ts">
	import { TimeField, type WithChildren } from 'bits-ui';
	let {
		children,
		class: className,
		...restProps
	}: WithChildren<TimeField.RootProps> & { class?: string } = $props();
</script>

<TimeField.Root {...restProps}>
	<div class={className}>
		{@render children?.()}
	</div>
</TimeField.Root>
