// The kernel and plugin overview: every node and edge names the Rust source that shows it, so the
// figure draws only what the code does. Line numbers are checked by kernel-overview.test.ts.

export type OverviewNode = {
	id: string;
	label: string;
	/** The Rust names the node stands for. */
	code: string;
	what: string;
	href: string;
	/** `crates/...` path and the line that shows the node. */
	source: { path: string; line: number; text: string };
	box: { x: number; y: number; w: number; h: number };
	group: 'plugin' | 'kernel' | 'host';
};

export type SharedPart = { id: string; label: string; module: string; href: string };

export type OverviewEdge = {
	from: string;
	to: string;
	/** Short text drawn on the figure. */
	label: string;
	/** The sentence in the text version of the figure. */
	sentence: string;
	path: string;
	at: [number, number];
	source: { path: string; line: number; text: string };
};

const left = 306;
const right = 534;
const width = 180;
const height = 60;

export const overviewNodes: OverviewNode[] = [
	{
		id: 'lang-tools', group: 'plugin', label: '言語の機能', code: 'Task',
		what: 'コンパイル、整形、コード検査などのタスクを登録します。', href: '/learn/plugins',
		source: { path: 'crates/languages/svelte/compile/src/task.rs', line: 29, text: '.task(Compile {' },
		box: { x: 32, y: 162, w: 188, h: height }
	},
	{
		id: 'lang-core', group: 'plugin', label: '言語の中核', code: 'Artifact',
		what: '構文解析や名前解決など、計算結果の型を登録します。', href: '/learn/kernel/layers',
		source: { path: 'crates/languages/svelte/core/src/computation.rs', line: 110, text: 'reg.artifact::<Resolved>()' },
		box: { x: 32, y: 262, w: 188, h: height }
	},
	{
		id: 'typecheck', group: 'plugin', label: '型検査', code: 'FinishTask',
		what: '全文書の準備が終わってから一度だけ動く処理を登録します。', href: '/learn/kernel/database#facet',
		source: { path: 'crates/languages/svelte/typecheck/src/registration.rs', line: 34, text: 'reg.finish_task(Check {' },
		box: { x: 32, y: 362, w: 188, h: height }
	},
	{
		id: 'registry', group: 'kernel', label: '処理の登録', code: 'Registry',
		what: 'プラグイン、タスク、計算結果の型、共通の呼び出し窓口を受け取ります。', href: '/learn/kernel/pipeline#registry',
		source: { path: 'crates/kernel/src/computation/pipeline.rs', line: 94, text: 'pub struct Registry {' },
		box: { x: left, y: 60, w: width, h: height }
	},
	{
		id: 'plugin-check', group: 'kernel', label: '依存関係の検査', code: 'Plugin, Dependency',
		what: 'プラグインの依存先と版を、処理を始める前に確かめます。', href: '/learn/kernel#modules',
		source: { path: 'crates/kernel/src/computation/pipeline.rs', line: 129, text: 'pub fn validate_plugins(&self) -> Result<(), PluginError> {' },
		box: { x: right, y: 60, w: width, h: height }
	},
	{
		id: 'run-document', group: 'kernel', label: '一つの文書の処理', code: 'run_document',
		what: '文書に当てはまるタスクを順に呼び、異常終了をその文書だけに閉じ込めます。', href: '/learn/kernel/pipeline#run-document',
		source: { path: 'crates/kernel/src/computation/pipeline.rs', line: 317, text: 'fn run_document(' },
		box: { x: left, y: 162, w: width, h: height }
	},
	{
		id: 'run', group: 'kernel', label: '文書ごとの並列実行', code: 'run, run_each',
		what: '文書を一つずつワーカーに渡して並列に処理します。', href: '/learn/kernel/pipeline#run',
		source: { path: 'crates/kernel/src/computation/pipeline.rs', line: 492, text: 'pub fn run(' },
		box: { x: right, y: 162, w: width, h: height }
	},
	{
		id: 'context', group: 'kernel', label: '計算結果の保存と再利用', code: 'DocumentContext::get',
		what: '求められた計算結果を文書ごとに一度だけ計算し、次からは保存した値を返します。', href: '/learn/kernel/database',
		source: { path: 'crates/kernel/src/computation/database.rs', line: 197, text: 'pub fn get<A: Artifact>(&self) -> &A::Output {' },
		box: { x: left, y: 262, w: width, h: height }
	},
	{
		id: 'facet', group: 'kernel', label: '共通の呼び出し窓口', code: 'Facet',
		what: '言語ごとに答え方が違う問いを、同じ型で受け取ります。', href: '/learn/kernel/database#facet',
		source: { path: 'crates/kernel/src/computation/database.rs', line: 34, text: 'pub trait Facet: \'static {' },
		box: { x: right, y: 262, w: width, h: height }
	},
	{
		id: 'project', group: 'kernel', label: '全文書をまとめる処理', code: 'run_finish_tasks',
		what: '各文書で準備した部分を集め、まとめる処理を一度だけ呼びます。', href: '/learn/kernel/pipeline#project',
		source: { path: 'crates/kernel/src/computation/pipeline.rs', line: 387, text: 'fn run_finish_tasks(' },
		box: { x: left, y: 362, w: width, h: height }
	},
	{
		id: 'output', group: 'kernel', label: 'タスクの出力', code: 'TaskOutput',
		what: 'タスクごとに、生成したファイルと診断を集めます。', href: '/learn/kernel/pipeline#tasks',
		source: { path: 'crates/kernel/src/computation/pipeline.rs', line: 72, text: 'pub struct TaskOutput {' },
		box: { x: right, y: 362, w: width, h: height }
	},
	{
		id: 'host', group: 'host', label: 'ホスト', code: 'コマンドライン、ブラウザ',
		what: '文書を作り、使うプラグインを登録して、カーネルの実行を呼びます。', href: '/learn/kernel#life',
		source: { path: 'crates/hosts/browser/src/computation/playground.rs', line: 242, text: 'pipeline::run(&reg' },
		box: { x: 790, y: 162, w: 176, h: height }
	}
];

export const sharedParts: SharedPart[] = [
	{ id: 'positions', label: 'ソース内の位置', module: 'kernel/source/positions', href: '/learn/kernel/source' },
	{ id: 'interning', label: '名前の共有', module: 'kernel/source/interning', href: '/learn/kernel/interning' },
	{ id: 'index', label: '識別番号', module: 'kernel/source/index', href: '/learn/kernel/layers' },
	{ id: 'tokens', label: '字句の記録', module: 'kernel/source/tokens', href: '/learn/kernel/layers' },
	{ id: 'hashing', label: 'ハッシュ値', module: 'kernel/source/hashing', href: '/learn/kernel#modules' },
	{ id: 'functions', label: '型を決めた関数', module: 'kernel/computation/functions', href: '/learn/kernel#modules' },
	{ id: 'diagnostics', label: '診断', module: 'kernel/diagnostics/diagnostic', href: '/learn/kernel/diagnostics' },
	{ id: 'document', label: 'コードの整形', module: 'kernel/output/document', href: '/learn/kernel/document' },
	{ id: 'emitter', label: '位置の対応', module: 'kernel/output/emitter', href: '/learn/kernel/emitter' },
	{ id: 'structured_data', label: '構造化データ', module: 'kernel/output/structured_data', href: '/learn/kernel/structured-data' },
	{ id: 'width', label: '文字の表示幅', module: 'kernel/output/width', href: '/learn/kernel/document' },
	{ id: 'measurement', label: '計測', module: 'kernel/performance/measurement', href: '/learn/kernel/measurement' },
	{ id: 'buffer_pool', label: '作業用メモリ', module: 'kernel/performance/buffer_pool', href: '/learn/kernel/buffer-pool' }
];

const pipeline = 'crates/kernel/src/computation/pipeline.rs';

export const overviewEdges: OverviewEdge[] = [
	{
		from: 'lang-core', to: 'registry', label: '型とタスクを登録',
		sentence: '言語プラグインは、計算結果の型、タスク、まとめる処理を「処理の登録」に渡します。',
		path: 'M126 132 V90 H306', at: [134, 82],
		source: { path: 'crates/languages/svelte/core/src/computation.rs', line: 107, text: 'pub fn register(reg: &mut Registry) {' }
	},
	{
		from: 'host', to: 'registry', label: '使うプラグインを登録',
		sentence: 'ホストは、使う言語プラグインの登録関数を呼びます。',
		path: 'M878 162 V8 H396 V60', at: [560, 0],
		source: { path: 'crates/hosts/browser/src/computation/playground.rs', line: 122, text: 'rsvelte_svelte_compile::register(&mut reg);' }
	},
	{
		from: 'registry', to: 'plugin-check', label: '実行前に検査',
		sentence: '実行を始める前に、登録したプラグインの依存関係を確かめます。',
		path: 'M486 90 H534', at: [480, 52],
		source: { path: pipeline, line: 497, text: 'reg.validate_plugins().map_err(RunError::Plugins)?;' }
	},
	{
		from: 'host', to: 'run', label: '文書とタスク',
		sentence: 'ホストは、文書と選んだタスクを実行に渡します。',
		path: 'M790 192 H714', at: [720, 184],
		source: { path: pipeline, line: 290, text: 'pub struct RunOptions<\'a> {' }
	},
	{
		from: 'run', to: 'run-document', label: '並列',
		sentence: '文書ごとに、別々のワーカーで一つの文書の処理を呼びます。',
		path: 'M534 192 H486', at: [498, 184],
		source: { path: pipeline, line: 510, text: 'docs.par_iter().map(compile).collect()' }
	},
	{
		from: 'run-document', to: 'lang-tools', label: 'タスクを呼ぶ',
		sentence: '一つの文書の処理は、その文書に当てはまるタスクを呼びます。',
		path: 'M306 186 H220', at: [230, 178],
		source: { path: pipeline, line: 330, text: 'for task in tasks.iter().filter(|t| t.applies(document)) {' }
	},
	{
		from: 'lang-tools', to: 'context', label: '結果を求める',
		sentence: 'タスクは、必要な構文木や解析結果を「計算結果の保存と再利用」に求めます。',
		path: 'M220 210 H262 V280 H306', at: [226, 246],
		source: { path: 'crates/languages/svelte/lint/src/rules/valid_each_key.rs', line: 12, text: '.get::<Normalized>()' }
	},
	{
		from: 'context', to: 'lang-core', label: '未計算なら計算',
		sentence: 'まだ計算していない結果だけ、言語の中核が計算します。',
		path: 'M306 304 H220', at: [228, 318],
		source: { path: 'crates/kernel/src/computation/database.rs', line: 27, text: 'pub trait Artifact: \'static {' }
	},
	{
		from: 'context', to: 'facet', label: '窓口',
		sentence: '言語をまたぐ問いには、共通の呼び出し窓口で答えます。',
		path: 'M486 304 H534', at: [496, 318],
		source: { path: 'crates/kernel/src/computation/database.rs', line: 219, text: 'pub fn facet<F: Facet>(&self) -> Option<&F::Output> {' }
	},
	{
		from: 'run-document', to: 'output', label: 'ファイルと診断',
		sentence: '各タスクは、生成したファイルと診断を出力に書きます。',
		path: 'M486 210 H510 V392 H534', at: [512, 352],
		source: { path: pipeline, line: 85, text: 'pub fn file(&mut self, name: impl Into<String>, text: String) {' }
	},
	{
		from: 'run-document', to: 'project', label: '準備した部分',
		sentence: '全文書をまとめる処理には、各文書で準備した部分を渡します。',
		path: 'M306 214 H296 V392 H306', at: [310, 352],
		source: { path: pipeline, line: 61, text: 'pub trait FinishTask: Send + Sync {' }
	},
	{
		from: 'project', to: 'typecheck', label: '最後に一度',
		sentence: '全文書の処理が終わってから、型検査のようなまとめる処理を一度だけ呼びます。',
		path: 'M306 392 H220', at: [232, 384],
		source: { path: pipeline, line: 517, text: 'run_finish_tasks(&finish_tasks, &mut results);' }
	},
	{
		from: 'output', to: 'host', label: '結果を返す',
		sentence: '出力は文書ごとの結果としてホストに返ります。',
		path: 'M714 392 H878 V222', at: [740, 384],
		source: { path: pipeline, line: 299, text: 'pub struct DocumentResult {' }
	}
];

/** Where each chapter page sits in the figure. The overview chapter itself shows the whole figure instead. */
export const chapterPositions: Record<string, string[]> = {
	'/learn/kernel': [],
	'/learn/kernel/source': ['part:positions'],
	'/learn/kernel/interning': ['part:interning'],
	'/learn/kernel/database': ['context', 'facet'],
	'/learn/kernel/layers': ['lang-core', 'part:index'],
	'/learn/kernel/pipeline': ['registry', 'run', 'run-document', 'project', 'output'],
	'/learn/kernel/diagnostics': ['part:diagnostics', 'output'],
	'/learn/kernel/document': ['part:document'],
	'/learn/kernel/emitter': ['part:emitter'],
	'/learn/kernel/structured-data': ['part:structured_data'],
	'/learn/kernel/measurement': ['part:measurement'],
	'/learn/kernel/buffer-pool': ['part:buffer_pool'],
	'/learn/measure': ['part:measurement', 'run'],
	'/learn/polish': ['part:emitter', 'part:positions', 'part:document', 'part:width', 'part:structured_data', 'part:diagnostics', 'part:measurement', 'part:buffer_pool', 'part:interning', 'run', 'project'],
	'/learn/plugins': ['lang-core', 'lang-tools', 'typecheck', 'registry']
};

export function positionLabel(id: string): string {
	if (id.startsWith('part:')) return `共通部品：${sharedParts.find((part) => `part:${part.id}` === id)!.label}`;
	return overviewNodes.find((node) => node.id === id)!.label;
}
