<script lang="ts">
	import { tick } from 'svelte';

	interface AstNode {
		type?: string;
		start?: number;
		end?: number;
		[key: string]: unknown;
	}

	interface Props {
		ast: AstNode | null;
		highlightRange?: { start: number; end: number } | null;
		onNodeClick?: (start: number, end: number) => void;
	}

	let { ast, highlightRange = null, onNodeClick }: Props = $props();

	let expandedPaths = $state<Set<string>>(new Set(['']));
	let lastHighlightRange: { start: number; end: number } | null = null;
	let containerRef: HTMLDivElement;

	function toggleExpand(path: string) {
		const newSet = new Set(expandedPaths);
		if (newSet.has(path)) {
			newSet.delete(path);
		} else {
			newSet.add(path);
		}
		expandedPaths = newSet;
	}

	function isExpanded(path: string): boolean {
		return expandedPaths.has(path);
	}

	function handleNodeClick(node: AstNode) {
		if (typeof node.start === 'number' && typeof node.end === 'number') {
			onNodeClick?.(node.start, node.end);
		}
	}

	function isHighlighted(node: AstNode): boolean {
		if (!highlightRange) return false;
		if (typeof node.start !== 'number' || typeof node.end !== 'number') return false;

		// Check if the cursor position is within this node
		return highlightRange.start >= node.start && highlightRange.start <= node.end;
	}

	function getNodePreview(node: unknown): string {
		if (node === null) return 'null';
		if (typeof node !== 'object') return String(node);

		const obj = node as AstNode;
		if (obj.type) {
			if (obj.name) return `${obj.type} "${obj.name}"`;
			if (obj.value !== undefined) return `${obj.type} = ${JSON.stringify(obj.value)}`;
			return obj.type;
		}
		if (Array.isArray(node)) return `Array(${node.length})`;
		return 'Object';
	}

	function isExpandable(value: unknown): boolean {
		return value !== null && typeof value === 'object';
	}

	function getEntries(obj: unknown): [string, unknown][] {
		if (Array.isArray(obj)) {
			return obj.map((item, index) => [String(index), item]);
		}
		if (obj && typeof obj === 'object') {
			return Object.entries(obj);
		}
		return [];
	}

	// Collect paths to expand and find the deepest matching path
	function collectPathsToExpand(
		node: unknown,
		path: string,
		cursorPos: number,
		paths: Set<string>,
		result: { deepestPath: string }
	): boolean {
		if (!node || typeof node !== 'object') return false;

		const obj = node as AstNode;
		const isMatch =
			typeof obj.start === 'number' &&
			typeof obj.end === 'number' &&
			cursorPos >= obj.start &&
			cursorPos <= obj.end;

		let hasMatchingChild = false;
		for (const [key, value] of getEntries(node)) {
			const childPath = path ? `${path}.${key}` : key;
			if (collectPathsToExpand(value, childPath, cursorPos, paths, result)) {
				hasMatchingChild = true;
			}
		}

		if (isMatch || hasMatchingChild) {
			paths.add(path);
			// Track the deepest matching path (leaf node with position)
			if (isMatch && !hasMatchingChild) {
				result.deepestPath = path;
			}
			return true;
		}

		return false;
	}

	// Scroll to element by path
	async function scrollToPath(path: string) {
		await tick(); // Wait for DOM to update
		if (!containerRef) return;

		const element = containerRef.querySelector(`[data-path="${CSS.escape(path)}"]`);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}

	// Auto-expand to highlighted node - only when highlight changes significantly
	$effect(() => {
		if (!highlightRange || !ast) return;

		// Only update if cursor moved significantly (different position)
		if (lastHighlightRange && lastHighlightRange.start === highlightRange.start) {
			return;
		}
		lastHighlightRange = { ...highlightRange };

		// Collect all paths that need to be expanded
		const pathsToExpand = new Set<string>(['']);
		const result = { deepestPath: '' };
		collectPathsToExpand(ast, '', highlightRange.start, pathsToExpand, result);

		// Merge with existing expanded paths
		const newExpandedPaths = new Set(expandedPaths);
		for (const path of pathsToExpand) {
			newExpandedPaths.add(path);
		}

		// Update expanded paths if needed
		if (newExpandedPaths.size !== expandedPaths.size) {
			expandedPaths = newExpandedPaths;
		}

		// Scroll to the deepest matching node
		if (result.deepestPath !== undefined) {
			scrollToPath(result.deepestPath);
		}
	});
</script>

{#snippet renderNode(node: unknown, path: string, depth: number)}
	{#if node === null}
		<span class="null">null</span>
	{:else if typeof node !== 'object'}
		<span class="primitive {typeof node}">{JSON.stringify(node)}</span>
	{:else}
		{@const obj = node as AstNode}
		{@const entries = getEntries(node)}
		{@const expanded = isExpanded(path)}
		{@const highlighted = isHighlighted(obj)}
		{@const hasPosition = typeof obj.start === 'number' && typeof obj.end === 'number'}

		<div class="node" class:highlighted class:has-position={hasPosition} data-path={path}>
			{#if entries.length > 0}
				<button class="toggle" onclick={() => toggleExpand(path)}>
					{expanded ? '\u25BC' : '\u25B6'}
				</button>
			{/if}

			{#if hasPosition}
				<button class="node-header clickable" onclick={() => handleNodeClick(obj)}>
					<span class="preview">{getNodePreview(node)}</span>
					<span class="position">[{obj.start}-{obj.end}]</span>
				</button>
			{:else}
				<span class="node-header">
					<span class="preview">{getNodePreview(node)}</span>
				</span>
			{/if}

			{#if expanded && entries.length > 0}
				<div class="children">
					{#each entries as [key, value]}
						<div class="entry">
							<span class="key">{key}:</span>
							{#if isExpandable(value)}
								{@render renderNode(value, path ? `${path}.${key}` : key, depth + 1)}
							{:else}
								<span class="value primitive {typeof value}">{JSON.stringify(value)}</span>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
{/snippet}

<div class="ast-viewer" bind:this={containerRef}>
	{#if ast}
		{@render renderNode(ast, '', 0)}
	{:else}
		<div class="empty">No AST available</div>
	{/if}
</div>

<style>
	.ast-viewer {
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 13px;
		line-height: 1.5;
		padding: 1rem;
		overflow: auto;
		height: 100%;
		background: #1a1a2e;
		color: #e4e4e7;
	}

	.node {
		position: relative;
	}

	.node.highlighted {
		background: rgba(255, 107, 53, 0.08);
		border-radius: 4px;
		margin: -2px;
		padding: 2px;
	}

	.node.highlighted.has-position {
		border-left: 1px solid rgba(255, 107, 53, 0.5);
		padding-left: 6px;
	}

	.toggle {
		background: none;
		border: none;
		color: #888;
		cursor: pointer;
		padding: 0;
		margin-right: 4px;
		font-size: 10px;
		width: 14px;
		display: inline-block;
		text-align: center;
	}

	.toggle:hover {
		color: #ff6b35;
	}

	.node-header {
		display: inline;
	}

	button.node-header {
		background: none;
		border: none;
		font-family: inherit;
		font-size: inherit;
		color: inherit;
		padding: 0;
		margin: 0;
	}

	.node-header.clickable {
		cursor: pointer;
		border-radius: 3px;
		padding: 1px 4px;
		margin: -1px -4px;
	}

	.node-header.clickable:hover {
		background: rgba(255, 107, 53, 0.2);
	}

	.preview {
		color: #4ec9b0;
		font-weight: 500;
	}

	.position {
		color: #888;
		font-size: 11px;
		margin-left: 8px;
	}

	.children {
		margin-left: 20px;
		border-left: 1px solid #333;
		padding-left: 8px;
	}

	.entry {
		margin: 2px 0;
	}

	.key {
		color: #9cdcfe;
	}

	.value {
		margin-left: 4px;
	}

	.primitive.string {
		color: #ce9178;
	}

	.primitive.number {
		color: #b5cea8;
	}

	.primitive.boolean {
		color: #569cd6;
	}

	.null {
		color: #569cd6;
		font-style: italic;
	}

	.empty {
		color: #888;
		text-align: center;
		padding: 2rem;
	}
</style>
