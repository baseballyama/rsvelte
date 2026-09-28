<script lang="ts">
	import type { UINode } from '$lib/types';
	import { useTypedNode } from '$lib/node.svelte';
	import { openUrl } from '@tauri-apps/plugin-opener';
	import { Button } from '$lib/components/ui/button';

	type Props = {
		nodeId: number;
		uiTree: Map<number, UINode>;
	};

	let { nodeId, uiTree }: Props = $props();

	const { props: componentProps } = $derived.by(
		useTypedNode(() => ({ nodeId, uiTree, type: 'Form.LinkAccessory' }))
	);

	function handleClick() {
		if (componentProps?.target) {
			openUrl(componentProps.target);
		}
	}
</script>

{#if componentProps}
	<Button
		variant="link"
		class="text-muted-foreground hover:text-foreground px-0 text-sm underline"
		onclick={handleClick}
	>
		{componentProps.text}
	</Button>
{/if}
