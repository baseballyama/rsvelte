<script lang="ts">
	let title: unknown = 't';
	let lang: string | null = null;
	let dir: string = 'ltr';
</script>

<div title={title as string}>a</div>
<div lang={lang!}>b</div>
<div dir={dir satisfies string}>c</div>
