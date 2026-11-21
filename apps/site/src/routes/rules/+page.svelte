<script lang="ts">
	import { resolve } from '$app/paths';
	import { rules } from '#lib/rules.ts';

	// oxlint's categories, in its order.
	const categories = [
		{ id: 'correctness', label: '誤りや無意味なコード' },
		{ id: 'suspicious', label: '誤りの疑いが強いコード' },
		{ id: 'pedantic', label: '厳しめの検査。正しいコードを報告することもあります' },
		{ id: 'perf', label: '実行時の性能' },
		{ id: 'style', label: '書き方の統一' },
		{ id: 'restriction', label: '特定の書き方の禁止' },
		{ id: 'nursery', label: '開発中のルール' },
	];
	const groups = categories
		.map(({ id, label }) => ({ id, label, rules: rules.filter((r) => r.category === id) }))
		.filter((group) => group.rules.length > 0);
	if (groups.reduce((sum, group) => sum + group.rules.length, 0) !== rules.length)
		throw new Error('A rule has a category this page does not list');
</script>

<svelte:head>
	<title>ルール ・ rsvelte</title>
</svelte:head>

<h1>ルール</h1>

<p>
	<code>rsvelte lint</code> が実装している {rules.length} 個のルールです。リンク先の ESLint、typescript-eslint、eslint-plugin-svelte
	のルールを移植したものです。<code>$:</code> などレガシー構文向けのルールも含みます。
</p>

<p>
	ルールは <code>rsvelte.config.json</code> で有効にします（<a href={resolve('/guide') + '#config'}
		>設定</a
	>）。<code>@typescript-eslint/no-unused-vars</code> は <code>typescript.lint</code>
	に、ほかのルールは
	<code>svelte.lint</code> に書きます。
</p>

<p>
	「対象」の列に JavaScript と TypeScript を含む <code>svelte/</code> のルールは、<code>.jsx</code>
	と
	<code>.tsx</code> も検査します。
</p>

{#each groups as group (group.id)}
	<h2 id={group.id}>{group.id}</h2>
	<p class="muted">{group.label}</p>
	<table>
		<thead>
			<tr><th>ルール</th><th>対象</th></tr>
		</thead>
		<tbody>
			{#each group.rules as rule (rule.name)}
				<tr>
					<td><a href={rule.url}><code>{rule.name}</code></a></td>
					<td class="files">{rule.files}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/each}

<style>
	.files {
		width: 40%;
	}
</style>
