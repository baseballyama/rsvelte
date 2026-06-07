<script lang="ts">
	interface Props {
		code: string;
		lang?: string;
		caption?: string;
	}

	let { code, lang = 'text', caption }: Props = $props();

	let copied = $state(false);
	let resetTimer: ReturnType<typeof setTimeout>;

	async function copy(): Promise<void> {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			clearTimeout(resetTimer);
			resetTimer = setTimeout(() => (copied = false), 1400);
		} catch {
			// Clipboard can be blocked (insecure context / permissions) — the
			// code is still selectable, so silently degrade.
		}
	}
</script>

<figure class="block">
	<figcaption class="head">
		<span class="lang">{caption ?? lang}</span>
		<button type="button" class="copy" class:copied onclick={copy}>
			{copied ? 'Copied' : 'Copy'}
		</button>
	</figcaption>
	<pre><code>{code}</code></pre>
</figure>

<style>
	.block {
		margin: 0;
		border: 1px solid var(--rule);
		border-radius: 6px;
		overflow: hidden;
		background: var(--editor-bg);
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.4rem 0.7rem;
		background: var(--paper);
		border-bottom: 1px solid var(--rule);
	}

	.lang {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 0.66rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}

	.copy {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 0.68rem;
		padding: 0.2rem 0.55rem;
		border: 1px solid var(--rule-strong);
		border-radius: 4px;
		background: var(--bg);
		color: var(--ink-soft);
		cursor: pointer;
		transition:
			color 0.15s,
			border-color 0.15s;
	}

	.copy:hover {
		color: var(--ink);
		border-color: var(--ink);
	}

	.copy.copied {
		color: var(--ok);
		border-color: var(--ok);
	}

	pre {
		margin: 0;
		padding: 0.85rem 0.9rem;
		overflow-x: auto;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 0.8rem;
		line-height: 1.6;
		color: var(--editor-ink);
	}

	code {
		font-family: inherit;
		white-space: pre;
	}
</style>
