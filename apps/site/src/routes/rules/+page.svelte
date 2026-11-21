<script lang="ts">
	import { resolve } from '$app/paths';
	import { rules } from '#lib/rules.ts';

	// oxlint's categories, in its order.
	const categories = [
		{ id: 'correctness', label: 'Code that is wrong or useless' },
		{ id: 'suspicious', label: 'Code that is probably wrong or useless' },
		{ id: 'pedantic', label: 'Strict rules, which can report correct code' },
		{ id: 'perf', label: 'Code that can run faster' },
		{ id: 'style', label: 'Code that has a more idiomatic form' },
		{ id: 'restriction', label: 'Rules that forbid a feature; turn them on one by one' },
		{ id: 'nursery', label: 'Rules still in development' },
	];
	const groups = categories
		.map(({ id, label }) => ({ id, label, rules: rules.filter((r) => r.category === id) }))
		.filter((group) => group.rules.length > 0);
	if (groups.reduce((sum, group) => sum + group.rules.length, 0) !== rules.length)
		throw new Error('A rule has a category this page does not list');
</script>

<svelte:head>
	<title>Rules · rsvelte</title>
</svelte:head>

<h1>Rules</h1>

<p>
	<code>rsvelte lint</code> implements these {rules.length} rules, ported from ESLint, typescript-eslint
	and eslint-plugin-svelte under the same names. Some of them check
	<a href={resolve('/guide') + '#legacy'}>legacy syntax</a>, such as <code>$:</code>. The categories
	come from oxlint, the linter of the oxc project.
</p>

<p>Without a configuration, three rules run:</p>

<ul class="inline">
	<li><code>no-unused-vars</code></li>
	<li><code>svelte/button-has-type</code></li>
	<li><code>@typescript-eslint/no-unused-vars</code></li>
</ul>

<p>
	Turn on the others in <code>rsvelte.config.json</code> (see the
	<a href={resolve('/guide') + '#config'}>guide</a>). Write
	<code>@typescript-eslint/no-unused-vars</code>
	under <code>typescript.lint</code>, and every other rule under <code>svelte.lint</code>. A
	<code>svelte/</code>
	rule whose Files column includes JavaScript and TypeScript also checks <code>.jsx</code> and
	<code>.tsx</code> files.
</p>

{#each groups as group (group.id)}
	<h2 id={group.id}>{group.id}</h2>
	<p class="muted">{group.label}</p>
	<table>
		<thead>
			<tr><th>Rule</th><th>Files</th></tr>
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
