// The /learn table of contents. Headings are rendered from here (`<H2 id>`), so the sidebar, the
// in-page anchors and the chapter order cannot drift apart.

export const REPO_URL = 'https://github.com/baseballyama/rsvelte';

export interface Section {
	id: string;
	title: string;
}

export interface Chapter {
	slug: string;
	href: string;
	number: string;
	title: string;
	/** One line for the chapter list. */
	abstract: string;
	/** The kernel module the chapter explains, as a source key. */
	module?: string;
	minutes: number;
	sections: Section[];
}

const s = (id: string, title: string): Section => ({ id, title });

export const chapters: Chapter[] = [
	{
		slug: 'intro',
		href: '/learn',
		number: '00',
		title: 'この教材について',
		abstract: '誰のための教材か、どう読むか、何が本物で何がモデルか。',
		minutes: 4,
		sections: [s('audience', '想定読者'), s('honesty', '本物とモデル'), s('path', '読む順番')]
	},
	{
		slug: 'kernel',
		href: '/learn/kernel',
		number: '01',
		title: 'カーネルの全体像',
		abstract: 'カーネルとプラグインの境界、モジュールの役割、1 文書が通る道、二つ目の言語 Vue と svue。',
		minutes: 15,
		sections: [
			s('why', 'なぜカーネルなのか'),
			s('layers', '層と境界'),
			s('modules', 'モジュールの役割'),
			s('life', 'ファイルを処理する手順'),
			s('languages', '二つ目の言語 — Vue と svue'),
			s('promises', '設計上の約束')
		]
	},
	{
		slug: 'source',
		href: '/learn/kernel/source',
		number: '02',
		title: 'ソース内の位置と行・列の変換',
		abstract: 'ソース内の範囲を8バイトで保存する方法と、バイト位置を行・列に変換する仕組み。',
		module: 'kernel/source/positions',
		minutes: 10,
		sections: [
			s('span', 'ソース内の範囲を8バイトで保存する'),
			s('loc', '元のソースにない要素の位置'),
			s('line-index', 'バイト位置と行・列を対応させる'),
			s('utf16', '外部ツールが使う文字数の数え方'),
			s('offset', '行と列からバイト位置を求める')
		]
	},
	{
		slug: 'intern',
		href: '/learn/kernel/interning',
		number: '03',
		title: '名前の保存と共有',
		abstract: '1 本のバッファと開番地法のテーブル。名前ごとの割り当てをしない。',
		module: 'kernel/source/interning',
		minutes: 7,
		sections: [
			s('why', '同じ名前を一度だけ保存する理由'),
			s('layout', '名前の文字列と末尾の位置'),
			s('table', '開番地法のテーブル'),
			s('growth', '配列を拡張するタイミング')
		]
	},
	{
		slug: 'db',
		href: '/learn/kernel/database',
		number: '04',
		title: '計算結果の保存と再利用',
		abstract: 'コンパイル、整形、コード検査で構文解析の結果を共有する仕組み。型検査には、各言語が生成したコードを共通の窓口から渡す。',
		module: 'kernel/computation/database',
		minutes: 18,
		sections: [
			s('artifact', '保存する計算結果の型'),
			s('registry', '計算結果の型と保存先を登録する'),
			s('get', '計算結果を取得する'),
			s('sharing', '結果を共有する場合と個別に計算する場合'),
			s('cycles', '計算の循環を検出する'),
			s('attribution', '計算時間をどの処理に記録するか'),
			s('facet', '共通の呼び出し窓口 — 言語ごとの答え')
		]
	},
	{
		slug: 'layers',
		href: '/learn/kernel/layers',
		number: '05',
		title: '構文木と解析結果の持ち方',
		abstract: '構文木の要素を型付きの番号で参照し、変数と宣言の対応を別の表に保存する。コンパイル用に整理した構文木は、別の言語からも作れる。',
		module: 'kernel/source/index',
		minutes: 20,
		sections: [
			s('why', 'なぜ層を重ねるのか'),
			s('ids', '型付きの識別番号と解析結果の表'),
			s('niche', '空き値を利用した識別番号と大きさの固定'),
			s('tokens', '元の文字列をすべて保持する — トークン表'),
			s('stack', 'Svelte の層'),
			s('resolve', '名前解決'),
			s('compiler_syntax_tree', 'コンパイル用に整理した構文木'),
			s('svue', 'Vue のコンポーネントを Svelte のランタイムで動かす'),
			s('vuelte', 'Svelte のコンポーネントを Vue のランタイムで動かす'),
			s('lint', '構文解析直後の検査と解析結果を使う検査'),
			s('shared-lint', '言語をまたぐ判断'),
			s('next', 'この先の層')
		]
	},
	{
		slug: 'pipeline',
		href: '/learn/kernel/pipeline',
		number: '06',
		title: '処理の登録と並列実行',
		abstract: 'タスク・プロジェクトタスク・共通の呼び出し窓口の提供元の登録と、文書単位の並列実行、ストリーミング。',
		module: 'kernel/computation/pipeline',
		minutes: 16,
		sections: [
			s('document', '入力文書と処理対象の判定'),
			s('tasks', '一つの文書の処理と複数の文書の処理'),
			s('registry', '処理の登録先'),
			s('run-document', '文書ごとの処理と異常終了への対処'),
			s('run-each', '結果ができた文書から順に返す'),
			s('project', '複数の文書をまとめて処理する'),
			s('run', '並列処理の結果をロックなしで集める')
		]
	},
	{
		slug: 'diagnostics',
		href: '/learn/kernel/diagnostics',
		number: '07',
		title: 'エラーや警告の報告とコード検査',
		abstract: 'Diagnostic、近似しないための Unsupported、Rule の守るべき条件と並び順。',
		module: 'kernel/diagnostics/rules',
		minutes: 8,
		sections: [
			s('diagnostic', 'エラーや警告の記録'),
			s('unsupported', '未対応の構文を報告する'),
			s('rule', '検査ルールが実装する処理'),
			s('order', '並び順'),
			s('render', 'ESLint の位置で書き出す')
		]
	},
	{
		slug: 'doc',
		href: '/learn/kernel/document',
		number: '08',
		title: '改行と字下げの決め方',
		abstract: 'Prettier と同じ規則で、一行に収めるか改行するかを決める。整形用のデータ構造と、それを文字列にする処理。',
		module: 'kernel/output/document',
		minutes: 20,
		sections: [
			s('ir', '整形用のデータ構造と保存領域'),
			s('printer', '整形の指示を順に処理する'),
			s('fits', '一行に収まるかを確かめる'),
			s('単語を収まるだけ一行に並べる', '単語を収まるだけ一行に並べる'),
			s('group-ids', '改行の判断を共有する'),
			s('flat-only', '改行なしで出力できる場合だけ返す'),
			s('mutation', '保存した整形指示を書き換える')
		]
	},
	{
		slug: 'emit',
		href: '/learn/kernel/emitter',
		number: '09',
		title: '生成したコードと元のソースの位置を対応させる',
		abstract: '出力バッファと位置の対応、指定位置以前で最も近い対応点の逆引き、source map v3 と 可変長の整数表現。',
		module: 'kernel/output/emitter',
		minutes: 15,
		sections: [
			s('emitter', '文字列の出力と位置の記録'),
			s('lookup', '生成した位置から元の位置を求める'),
			s('lookup-span', '生成したコードの範囲を元のソースに戻す'),
			s('source-map', '外部ツール向けに位置の対応表を書き出す'),
			s('disagreement', '内部と外部で位置の対応を揃える'),
			s('edits', 'ソース内の一部を置き換える')
		]
	},
	{
		slug: 'json',
		href: '/learn/kernel/structured-data',
		number: '10',
		title: '構造化データを直接書き出す',
		abstract: '値の木を作らずに書く。状態はフラグのスタックとビット 1 つ。',
		module: 'kernel/output/structured_data',
		minutes: 5,
		sections: [s('state', '状態は 2 つだけ'), s('escape', 'エスケープ')]
	},
	{
		slug: 'metrics',
		href: '/learn/kernel/measurement',
		number: '11',
		title: '処理時間とメモリの計測',
		abstract: 'メモリを確保する回数と大きさを数える。処理時間は、内側で呼んだ別の処理の時間を差し引いて記録する。',
		module: 'kernel/performance/measurement',
		minutes: 12,
		sections: [
			s('alloc', 'メモリを確保する回数と大きさを数える'),
			s('phases', '別の処理にかかった時間を差し引く'),
			s('merge', 'スレッドの表をまとめる'),
			s('global', '処理全体の計測と最大使用量'),
			s('off', '計測を無効にしたビルドの動作')
		]
	},
	{
		slug: 'pool',
		href: '/learn/kernel/buffer-pool',
		number: '12',
		title: '作業用メモリの再利用',
		abstract: '文書をまたいで Vec の容量を使い回す、スレッドローカルのプール。持ち主ごとの鍵と、スレッドあたりの予算。',
		module: 'kernel/performance/buffer_pool',
		minutes: 10,
		sections: [
			s('idea', '考え方'),
			s('take-give', '作業用の配列を借りて返す'),
			s('keyed', '異なる用途の配列を区別する'),
			s('limits', '上限と予算'),
			s('users', 'プールを使う構造'),
			s('measure', '効果を測る')
		]
	},
	{
		slug: 'measure',
		href: '/learn/measure',
		number: '13',
		title: '実測 — 性能の基準値との比較検査',
		abstract: '割り当てと命令数を決定的に数え、すべての push で基準値と比べる。正しさの基準値との比較検査と、実行時間のベンチマーク。',
		minutes: 14,
		sections: [
			s('ratchet', '性能の基準値との比較検査'),
			s('counters', '数えるもの'),
			s('determinism', '同じ入力で同じ計測値を得る仕組み'),
			s('ci', '変更時の自動検査と基準値の更新'),
			s('parity', '正しさの基準値との比較検査'),
			s('arms', '実行時間の比較対象'),
			s('time', '時間'),
			s('memory', 'メモリと割り当て'),
			s('phases', 'フェーズ'),
			s('reproduce', '再現する')
		]
	},
	{
		slug: 'polish',
		href: '/learn/polish',
		number: '14',
		title: '磨きどころ',
		abstract: '最適化の記録と計測した差分。コードを読んで見つけた、直す価値のある箇所と、それぞれをどうしたか。',
		minutes: 16,
		sections: [
			s('history', '最適化の記録'),
			s('correctness', '正しさ'),
			s('contracts', '守るべき条件と文書'),
			s('performance', '性能'),
			s('measurement', '計測')
		]
	},
	{
		slug: 'plugins',
		href: '/learn/plugins',
		number: '15',
		title: 'プラグインを実装する',
		abstract: 'Svelte の構文解析結果を使い、独自の計算結果とタスクをカーネルに登録する。',
		minutes: 12,
		sections: [
			s('boundary', 'ライブラリとして使う場合とタスクとして使う場合'),
			s('parsed', '構文解析の結果を保存する'),
			s('artifact', '構文解析の結果から独自の値を計算する'),
			s('task', '計算結果を使うタスクを実装する'),
			s('register', '必要な型とタスクを登録する'),
			s('host', '呼び出し側から実行する'),
			s('extension', '言語を追加する場合と複数の文書を扱う場合')
		]
	}
];

export const appendix = [
	{ href: '/learn/reference', title: 'リファレンス', abstract: 'カーネルの全項目を検索する。' },
	{ href: '/learn/playground', title: 'パイプラインのプレイグラウンド', abstract: '言語プラグインを付け外しし、ソースの解析と出力を追う。' },
	{ href: '/learn/playground/doc', title: '整形の判断を試す', abstract: '整形用のデータ構造を書いて、プリンタの判断を追う。' }
];

export function chapterByHref(pathname: string): Chapter | undefined {
	const p = pathname.replace(/\/$/, '') || '/';
	return chapters.find((c) => c.href === p);
}

export function sectionTitle(chapter: Chapter, id: string): string {
	const sec = chapter.sections.find((x) => x.id === id);
	if (!sec) throw new Error(`chapter ${chapter.slug} has no section ${id}`);
	return sec.title;
}

export function chapter(slug: string): Chapter {
	const c = chapters.find((x) => x.slug === slug);
	if (!c) throw new Error(`no chapter ${slug}`);
	return c;
}
