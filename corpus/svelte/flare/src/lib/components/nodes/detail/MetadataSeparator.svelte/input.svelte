<script lang="ts">
	import type { UINode } from '$lib/types';

	type Props = {
		nodeId: number;
		uiTree: Map<number, UINode>;
		onDispatch: (instanceId: number, handlerName: string, args: unknown[]) => void;
	};

	let {}: Props = $props();
</script>

<hr class="border-gray-200 dark:border-gray-700" />
