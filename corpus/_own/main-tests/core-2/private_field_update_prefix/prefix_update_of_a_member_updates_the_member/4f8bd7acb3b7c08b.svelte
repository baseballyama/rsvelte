<script>
class C {
	#n = $state({ v: 1 });
	m() {
		++this.#n.v;
		--this.#n[0];
	}
}
</script>
