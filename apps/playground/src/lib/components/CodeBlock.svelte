<script lang="ts">
	interface Props {
		code: string;
		lang?: string;
		caption?: string;
	}

	let { code, lang = 'text', caption }: Props = $props();

	let copied = $state(false);
	let highlighted = $state('');
	let resetTimer: ReturnType<typeof setTimeout>;
	let renderSequence = 0;

	const languageAliases: Record<string, string> = {
		sh: 'bash',
		shell: 'bash',
		javascript: 'js',
		typescript: 'ts'
	};

	$effect(() => {
		const source = code;
		const language = languageAliases[lang] ?? lang;
		const sequence = ++renderSequence;
		highlighted = '';

		void (async () => {
			try {
				const { highlightCode } = await import('$lib/highlight');
				const html = await highlightCode(source, language || 'text');
				if (sequence === renderSequence) highlighted = html;
			} catch {
				// The plain-code fallback remains readable if a language is not in the web bundle.
			}
		})();
	});

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
	{#if highlighted}
		<div class="highlight">{@html highlighted}</div>
	{:else}
		<pre class="fallback"><code>{code}</code></pre>
	{/if}
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

	.fallback,
	.highlight :global(.shiki) {
		margin: 0;
		padding: 0.85rem 0.9rem;
		overflow-x: auto;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 0.8rem;
		line-height: 1.6;
		tab-size: 2;
	}

	.fallback {
		color: var(--editor-ink);
		background: var(--editor-bg);
	}

	.highlight :global(.shiki code),
	.fallback code {
		font-family: inherit;
		white-space: pre;
	}

	:global(html[data-theme='dark']) .highlight :global(.shiki),
	:global(html[data-theme='dark']) .highlight :global(.shiki span) {
		color: var(--shiki-dark) !important;
		background-color: var(--shiki-dark-bg) !important;
	}
</style>
