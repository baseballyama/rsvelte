<script lang="ts">
	type Deep = { a?: { b?: { c?: string[] } } };

	let d = $state<Deep>({});
	const el = null as unknown as HTMLInputElement;

	const v1 = d.a!.b!.c![0];
	const v2 = d?.a?.b?.c?.[0];
	const v3 = (d as Deep).a?.b?.c?.at?.(0);
	const v4 = <string>(d.a?.b?.c?.[0] ?? '');
	const v5 = d.a?.b?.c! as readonly string[];
	const v6 = el!.value satisfies string;
</script>

<p>{v1}{v2}{v3}{v4}{v5.length}{v6}</p>
