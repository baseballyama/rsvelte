<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<!-- Tufte-style: the marker and the note share one CSS counter, so numbering needs no bookkeeping. -->
<sup class="note-ref"></sup><span class="note">{@render children()}</span>

<style>
	.note-ref {
		counter-increment: note;
		font-family: var(--font-mono);
		font-size: 0.7em;
		color: var(--muted);
		padding-left: 1px;
	}
	.note-ref::after {
		content: counter(note);
	}
	.note {
		display: block;
		margin: 0.6em 0;
		padding: 8px 12px;
		background: var(--surface);
		border-radius: var(--radius-sm);
		font-size: 14px;
		line-height: 1.7;
		letter-spacing: 0.01em;
		color: var(--fg-2);
	}
	.note::before {
		content: counter(note) '. ';
		font-family: var(--font-mono);
		color: var(--muted);
	}
	@media (min-width: 1280px) {
		.note {
			float: right;
			clear: right;
			width: 232px;
			margin: 0.25em calc(-232px - 48px) 1em 0;
			padding: 0;
			background: none;
		}
	}
</style>
