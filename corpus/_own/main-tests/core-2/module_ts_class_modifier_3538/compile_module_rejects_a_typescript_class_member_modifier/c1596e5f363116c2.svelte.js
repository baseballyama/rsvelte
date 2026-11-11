class B {
	m() {
		return 1;
	}
}

class K extends B {
	protected set a(v) {}
}

const r = new K().m();

export { r };
