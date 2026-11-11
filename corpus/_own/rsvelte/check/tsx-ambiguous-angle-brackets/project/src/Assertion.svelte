<script lang="ts">
	const raw: unknown = 1;
	const n = <number>raw; const wrong: string = n;
	const paren = <string>(raw);
</script>

<p>{n}{wrong}{paren}</p>
