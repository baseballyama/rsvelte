<script>
	const 一覧 = [{ id: 1 }];
	const 外部 = 'x';
</script>

{#each 一覧 as 項目 (項目.id)}
	<span>{項目.id}</span>
{/each}
{#each 一覧 as 項目 (外部)}
	<span>{項目.id}{外部}</span>
{/each}
