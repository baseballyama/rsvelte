<script lang="ts">
	type Html = string;
	let raw: unknown = '<b>x</b>';
	const t = { v: '<i/>' } satisfies { v: Html };
</script>

{@html raw as Html}
{@html <string>t.v}
{@html (raw satisfies unknown) as string}
