class B {
	m() {
		return 1;
	}
}

class K extends B {
	private ['x'] = 1;
}

const r = new K().m();

export { r };
