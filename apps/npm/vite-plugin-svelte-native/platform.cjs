'use strict';

function resolveTriple(runtime) {
	const { platform, arch } = runtime;
	if (platform === 'darwin') {
		if (arch === 'arm64') return 'darwin-arm64';
		if (arch === 'x64') return 'darwin-x64';
	} else if (platform === 'linux') {
		let isMusl = false;
		try {
			isMusl = !runtime.report.getReport().header.glibcVersionRuntime;
		} catch {}
		if (isMusl) return null;
		if (arch === 'x64') return 'linux-x64-gnu';
		if (arch === 'arm64') return 'linux-arm64-gnu';
	} else if (platform === 'win32' && arch === 'x64') {
		return 'win32-x64-msvc';
	}
	return null;
}

module.exports = { resolveTriple };
