class B {
	m() {
		return 1;
	}
}

class K extends B {
	abstract a = 1;
}

const r = new K().m();

export { r };
