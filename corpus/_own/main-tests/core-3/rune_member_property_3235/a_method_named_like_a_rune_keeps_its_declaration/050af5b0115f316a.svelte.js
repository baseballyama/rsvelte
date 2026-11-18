class C {
	$derived(v) { return v; }
	m() { return this.$derived(1); }
}
export const a = new C().m();