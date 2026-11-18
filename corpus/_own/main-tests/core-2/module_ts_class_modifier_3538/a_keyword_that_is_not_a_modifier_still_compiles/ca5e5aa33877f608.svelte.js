class B {
	m() {
		return 1;
	}
}

class K extends B {
	accessor() { return 1; }
}

const r = new K().m();

export { r };
