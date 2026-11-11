class C {
	$inspect(v) { return v; }
	m() { return this.$inspect(1); }
}
export const a = new C().m();