<script lang="ts">
	class K {
		m(a: number): number;
		m(a: string): string;
		m(a: any) { return a; }
	}
	const v = 1;
</script>
<b>{v}</b>
