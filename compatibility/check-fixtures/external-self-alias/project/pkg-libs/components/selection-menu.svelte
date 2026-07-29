<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import Input from '$libs/components/input.svelte';

	interface Props {
		search?: {
			onChange?: ComponentProps<typeof Input>['onChange'];
			placeholder?: string;
		};
	}

	let { search }: Props = $props();
</script>

{#if search}
	<Input onChange={search.onChange} />
{/if}
