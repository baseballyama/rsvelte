<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { writable, derived, type Readable } from 'svelte/store';

	type Severity = 'info' | 'warning' | 'error';

	interface Notice {
		id: string;
		severity: Severity;
		message: string;
		at: number;
	}

	export let title: string = 'Notifications';
	export let notices: Notice[] = [];
	export let maxVisible: number = 5;
	export let dismissable: boolean = true;
	export let emptyLabel: string = 'Nothing to show';
	export let severityFilter: Severity | null = null;

	const dispatch = createEventDispatcher<{ dismiss: { id: string }; seen: void }>();

	const now = writable(Date.now());
	const unreadCount = writable(0);
	const label: Readable<string> = derived(unreadCount, (n) => (n === 0 ? 'read' : `${n} unread`));

	let expanded = false;
	let hovered: string | null = null;
	let container: HTMLDivElement;

	$: filtered = severityFilter ? notices.filter((n) => n.severity === severityFilter) : notices;
	$: visible = expanded ? filtered : filtered.slice(0, maxVisible);
	$: hiddenCount = filtered.length - visible.length;
	$: errorCount = filtered.filter((n) => n.severity === 'error').length;
	$: heading = errorCount > 0 ? `${title} (${errorCount})` : title;
	$: ages = visible.map((n) => Math.max(0, Math.round(($now - n.at) / 1000)));

	$: if (errorCount > 0 && !expanded) {
		expanded = true;
	}

	function dismiss(id: string): void {
		notices = notices.filter((n) => n.id !== id);
		unreadCount.update((n) => Math.max(0, n - 1));
		dispatch('dismiss', { id });
	}

	function severityClass(severity: Severity): string {
		return `notice notice--${severity}`;
	}

	onMount(() => {
		const timer = setInterval(() => now.set(Date.now()), 1000);
		dispatch('seen');
		return () => clearInterval(timer);
	});
</script>

<div class="panel" bind:this={container} class:panel--expanded={expanded}>
	<header>
		<h2>{heading}</h2>
		<span class="badge">{$label}</span>
	</header>

	{#if visible.length === 0}
		<p class="empty">{emptyLabel}</p>
	{:else}
		<ul>
			{#each visible as notice, i (notice.id)}
				<li
					class={severityClass(notice.severity)}
					on:mouseenter={() => (hovered = notice.id)}
					on:mouseleave={() => (hovered = null)}
				>
					<span class="message">{notice.message}</span>
					<span class="age">{ages[i]}s</span>
					{#if dismissable && hovered === notice.id}
						<button type="button" on:click={() => dismiss(notice.id)}>Dismiss</button>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}

	{#if hiddenCount > 0}
		<button class="more" type="button" on:click={() => (expanded = !expanded)}>
			{expanded ? 'Show less' : `Show ${hiddenCount} more`}
		</button>
	{/if}
</div>

<style>
	.panel {
		border: 1px solid #d8d8de;
		border-radius: 6px;
		padding: 12px;
	}

	.panel--expanded {
		box-shadow: 0 2px 8px rgb(0 0 0 / 12%);
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.notice {
		display: flex;
		gap: 8px;
		padding: 6px 0;
	}

	.notice--error {
		color: #b3261e;
	}

	.notice--warning {
		color: #8a6d00;
	}

	.empty {
		color: #6c6c76;
		font-style: italic;
	}
</style>
