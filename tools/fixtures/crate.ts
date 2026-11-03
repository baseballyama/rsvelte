// Copies the units of one family into a crate's tests/fixtures/, as cases of rsvelte_fixture_test
// (crates/fixture_test/README.md): tests/fixtures/<source>/<path>/{input.*, expected/<variant>.*}.
// The corpus stays the source of truth; run this again after `regen` or `import`.
import fs from 'node:fs';
import path from 'node:path';
import { allUnits, applies, loadSources } from './manifest.ts';
import { encodePath, expectedFile, inputFile, licensesDir, ORACLES_FILE, ROOT } from './paths.ts';
import { stableStringify } from './fsutil.ts';
import { taskById } from './tasks/index.ts';

// Names next to the units in tests/fixtures/<source>/; the harness reads SOURCE_FILE to know that
// expected/ holds the oracle's output.
const SOURCE_FILE = 'source.json';
const LICENSES_DIR = 'licenses';
// The crate's hand-written cases, whose expected/ is rsvelte's own accepted output.
const HAND_WRITTEN = 'rsvelte';

interface Position {
	line: number;
	column: number;
}

interface Diagnostic {
	code: string;
	message: string;
	start: Position | null;
	end: Position | null;
}

/** The harness's diagnostics format (crates/fixture_test/src/snapshots.rs): 1-based lines and columns. */
function diagnosticsText(severity: string, diagnostics: Diagnostic[]): string {
	return diagnostics
		.map((d) => {
			const at = (p: Position) => `${p.line}:${p.column + 1}`;
			const span = d.start ? ` ${at(d.start)}${d.end ? `-${at(d.end)}` : ''}` : '';
			return `${severity} ${d.code}${span} ${d.message.replaceAll('\n', '\n    ')}\n`;
		})
		.join('');
}

export interface CrateExportOptions {
	family: string;
	taskIds: string[];
	/** The crate's tests/fixtures directory. */
	to: string;
	sourceIds?: string[];
}

export function exportToCrate({ family, taskIds, to, sourceIds }: CrateExportOptions): { units: number; files: number } {
	const tasks = taskIds.map(taskById);
	const sources = new Map(loadSources().map((s) => [s.id, s]));
	const oracles = JSON.parse(fs.readFileSync(ORACLES_FILE, 'utf8'));
	const units = allUnits(sourceIds, [family]);
	const bySource = Map.groupBy(units, (u) => u.source);
	let files = 0;
	for (const [id, sourceUnits] of bySource) {
		if (id === HAND_WRITTEN) throw new Error(`source ${id}: the name is taken by the hand-written cases`);
		const source = sources.get(id)!;
		const dest = path.join(to, id);
		fs.rmSync(dest, { recursive: true, force: true });
		fs.mkdirSync(dest, { recursive: true });
		const record = {
			url: source.url,
			commit: source.commit,
			license: source.license?.spdx ?? null,
			oracles: Object.fromEntries(tasks.map((t) => [t.id, oracles[t.id]?.oracles ?? null]))
		};
		fs.writeFileSync(path.join(dest, SOURCE_FILE), stableStringify(record) + '\n');
		fs.cpSync(licensesDir(id), path.join(dest, LICENSES_DIR), { recursive: true });
		for (const unit of sourceUnits) {
			const top = unit.path.split('/')[0];
			if (top === SOURCE_FILE || top === LICENSES_DIR) throw new Error(`${id}/${unit.path}: the first path segment is reserved`);
			const dir = path.join(dest, encodePath(unit.path));
			fs.mkdirSync(dir, { recursive: true });
			fs.copyFileSync(inputFile(unit, unit.ext), path.join(dir, `input${unit.ext}`));
			files++;
			const written = new Set<string>();
			const write = (name: string, text: string) => {
				if (written.has(name)) throw new Error(`${id}/${unit.path}: two tasks write expected/${name}`);
				written.add(name);
				fs.mkdirSync(path.join(dir, 'expected'), { recursive: true });
				fs.writeFileSync(path.join(dir, 'expected', name), text);
				files++;
			};
			for (const task of tasks) {
				for (const variant of task.variants) {
					if (!applies(task, variant.id, unit)) continue;
					const read = (ext: string): string | null => {
						const file = expectedFile(task, variant.id, unit, ext);
						return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
					};
					for (const ext of ['js', 'css']) {
						const text = read(ext);
						if (text !== null) write(`${variant.id}.${ext}`, text);
					}
					const error = read('error.json');
					const warnings = read('warnings.json');
					const diagnostics =
						(error ? diagnosticsText('error', [JSON.parse(error)]) : '') +
						(warnings ? diagnosticsText('warning', JSON.parse(warnings)) : '');
					if (diagnostics) write(`${variant.id}.diagnostics.txt`, diagnostics);
				}
			}
		}
		console.log(`${id.padEnd(32)} ${String(sourceUnits.length).padStart(6)} units`);
	}
	console.log(`${units.length} units from ${bySource.size} sources, ${files} files written to ${path.relative(ROOT, to)}`);
	return { units: units.length, files };
}
