<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	const id = $props.id();
</script>

<!-- The marker and the note share one CSS counter, so numbering needs no bookkeeping. The note is a popover anchored to its marker, so opening it does not reflow the sentence around it. -->
<sup class="note-ref"
	><button type="button" popovertarget="note-{id}" style:anchor-name="--note-{id}" aria-label="注を開く"></button></sup
><span class="note" id="note-{id}" popover="auto" role="note" style:position-anchor="--note-{id}"
	>{@render children()}</span
>

<style>
	.note-ref {
		counter-increment: note;
		font-size: 0.68em;
		line-height: 0;
		padding-left: 2px;
	}
	.note-ref button {
		min-width: 1.5em;
		padding: 0.1em 0.35em;
		border-radius: 999px;
		background: var(--accent-wash);
		color: var(--accent);
		font-family: var(--font-mono);
		font-weight: 500;
		line-height: 1.4;
		cursor: pointer;
		vertical-align: 0.15em;
	}
	.note-ref button:hover,
	.note-ref:has(+ .note:popover-open) button {
		background: var(--accent);
		color: var(--bg);
	}
	.note-ref button::after {
		content: counter(note);
	}
	.note {
		width: min(380px, calc(100vw - 32px));
		margin: 0;
		padding: 10px 14px 11px;
		border: 1px solid var(--border);
		border-top: 2px solid var(--accent);
		border-radius: var(--radius-md);
		background: var(--raised);
		box-shadow: var(--shadow-pop);
		color: var(--fg-2);
		font-size: 14px;
		line-height: 1.8;
		letter-spacing: 0.01em;
		text-align: left;
	}
	.note:popover-open {
		animation: note-in 140ms ease-out;
	}
	@supports (position-area: bottom) {
		.note {
			position-area: bottom span-right;
			position-try-fallbacks:
				bottom span-left,
				top span-right,
				top span-left;
			margin: 8px 0;
		}
	}
	.note::before {
		content: '注';
		display: block;
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.04em;
		color: var(--accent);
	}
	@keyframes note-in {
		from {
			opacity: 0;
			transform: translateY(-3px);
		}
	}
</style>
