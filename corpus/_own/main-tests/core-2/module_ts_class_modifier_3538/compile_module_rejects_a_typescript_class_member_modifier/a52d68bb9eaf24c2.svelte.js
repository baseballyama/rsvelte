class B {
	m() {
		return 1;
	}
}

class K extends B {
	private m() {}
}

const r = new K().m();

export { r };
