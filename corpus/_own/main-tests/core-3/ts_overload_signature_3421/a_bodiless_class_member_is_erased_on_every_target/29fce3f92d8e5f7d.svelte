<script lang="ts">
	class K {
		#m(a: number): number;
		#m(a: any) { return a; }
		go() { return this.#m(1); }
	}
	const v = 1;
</script>
<b>{v}</b>
