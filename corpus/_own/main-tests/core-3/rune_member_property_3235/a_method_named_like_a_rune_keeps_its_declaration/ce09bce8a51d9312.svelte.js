class C {
	$state(v) { return v; }
	m() { return this.$state(1); }
}
export const a = new C().m();