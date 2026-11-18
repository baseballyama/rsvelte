class C {
	$effect(v) { return v; }
	m() { return this.$effect(1); }
}
export const a = new C().m();