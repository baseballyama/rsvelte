import type { UINode } from '$lib/types';
import { getTypedProps, type Schemas, type ComponentType } from '$lib/props';
import type { z } from 'zod/v4';

export function useTypedNode<T extends ComponentType>(
	args: () => {
		nodeId: number;
		uiTree: Map<number, UINode>;
		type: T | T[];
	}
) {
	const { nodeId, uiTree, type: expectedTypes } = $derived.by(args);

	let node = $state<UINode | undefined>(undefined);
	let props = $state<z.infer<Schemas[T]> | null>(null);

	$effect(() => {
		const n = uiTree.get(nodeId);
		if (n) {
			const types = Array.isArray(expectedTypes) ? expectedTypes : [expectedTypes];
			if (!types.includes(n.type as T)) {
				console.error(
					`Type mismatch for node ${nodeId}. Expected one of [${types.join(', ')}], but got ${n.type}`
				);
				node = undefined;
				props = null;
			} else {
				node = n;
				props = getTypedProps(n as UINode & { type: T });
			}
		} else {
			node = undefined;
			props = null;
		}
	});

	return () => ({ node, props });
}
