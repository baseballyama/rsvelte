const moduleDescriptions: Record<string, { title: string; summary: string }> = {
	'kernel/source': {
		title: 'ソースの記録',
		summary: '文書、位置、名前、字句を扱います。',
	},
	'kernel/computation': {
		title: '計算と実行',
		summary: '計算結果の保存、タスクの定義、処理の登録と実行を扱います。',
	},
	'kernel/diagnostics': {
		title: 'エラーや警告の情報',
		summary: '問題の種類、メッセージ、ソース内の位置を記録します。',
	},
	'kernel/output': {
		title: '文字列の出力',
		summary: '位置の対応を持つコードの出力、元の文への編集、JSON の書き出しを扱います。',
	},
	'kernel/performance': {
		title: '性能の計測と改善',
		summary: '時間とメモリの計測と、作業用メモリの再利用を扱います。',
	},
	'document_printer/width': {
		title: '文字の表示幅',
		summary: '文字が画面で占める幅を、Unicode の幅の規則で計算します。',
	},
	'kernel/source/document': {
		title: '文書',
		summary: '処理する文書のパスと本文を持ち、大きさの上限を入口で一度だけ確かめます。',
	},
	'kernel/source/positions': {
		title: 'ソース内の位置',
		summary: '文字列内の範囲と、バイト位置・行・列の変換を扱います。',
	},
	'kernel/source/positions/tests': {
		title: 'ソース内の位置のテスト',
		summary:
			'UTF-16 の列がサロゲートペアを数えること、二文字の改行を行の中身に含めないこと、文字の途中の位置をその文字の先頭へ丸めることを確かめます。',
	},
	'kernel/source/interning': {
		title: '名前の保存と共有',
		summary: '同じ名前を一度だけ保存し、番号で参照します。',
	},
	'kernel/source/interning/tests': {
		title: '名前の保存と共有のテスト',
		summary:
			'同じ名前を何度登録しても同じ番号になり、表が大きくなっても変わらないこと、登録済みの名前で表が増えないことを確かめます。',
	},
	'kernel/source/tokens': {
		title: '字句の記録',
		summary: '空白やコメントを含むトークンを並べ、元のソースを欠けなく持ちます。',
	},
	'kernel/source/tokens/tests': {
		title: '字句の記録のテスト',
		summary: '検索が空白とコメントを飛ばすこと、抜けや短すぎる表を報告することを確かめます。',
	},
	'kernel/computation/database': {
		title: '計算結果の保存と再利用',
		summary: '構文解析などの結果を文書ごとに保存し、複数の処理で共有します。',
	},
	'kernel/computation/database/tests': {
		title: '計算結果の保存と再利用のテスト',
		summary:
			'記録したアクセスが、新しく計算した場合と保存済みの結果を使った場合を区別することを確かめます。',
	},
	'kernel/index': {
		title: '型付きの識別番号',
		summary: '構文木の各要素を番号で参照し、その要素に対応する解析結果を保存します。',
	},
	'kernel/index/tests': {
		title: '型付きの識別番号のテスト',
		summary:
			'追加した順に連続した番号が振られ、対応する表と位置がそろうこと、範囲が追加した要素をそのまま切り出すことを確かめます。',
	},
	'kernel/computation/task': {
		title: 'タスクの定義',
		summary: '文書ごとのタスクと全文書をまとめるタスクの形、タスクが残すファイルと診断を定めます。',
	},
	'kernel/computation/registry': {
		title: '処理の登録',
		summary:
			'プラグイン、計算結果の型、共通の呼び出し窓口、タスクを登録し、実行するタスクを選びます。',
	},
	'kernel/computation/pipeline': {
		title: '処理の実行',
		summary:
			'選んだタスクで文書を並列に処理し、全文書をまとめる処理を最後に一度だけ呼んで結果を返します。',
	},
	'kernel/computation/pipeline/tests': {
		title: '処理の実行のテスト',
		summary:
			'文書ごとの処理と全文書をまとめる処理に渡る値、依存関係が正しくないときに処理を始めないことを確かめます。',
	},
	'kernel/computation/plugins': {
		title: 'プラグインの依存関係の検査',
		summary:
			'プラグインの名前、版、依存先を登録し、依存先の不足、版の不一致、循環を処理の前に見つけて、原因ごとに区別して報告します。',
	},
	'kernel/computation/plugins/tests': {
		title: 'プラグインの依存関係の検査のテスト',
		summary:
			'版の条件が Cargo と同じ規則で判定されること、登録の順で結果が変わらないこと、各エラーが原因の名前を示すことを確かめます。',
	},
	'lint/output': {
		title: '検査結果の書き出し',
		summary: '指摘の位置を行と列に直し、検査結果を書き出します。',
	},
	'lint/rule': {
		title: '検査ルールの約束',
		summary: '検査ルールが実装する処理と、指摘を報告する唯一の窓口を定めます。',
	},
	'lint/findings': {
		title: 'コードの問題の検査',
		summary: '検査ルールを実行し、指摘の並び順を決めます。',
	},
	'document_printer/lib': {
		title: 'コードの整形',
		summary: '改行と字下げの指示を組み合わせ、指定した幅に合わせて文字列を作ります。',
	},
	'kernel/output/emitter': {
		title: 'コードの出力と位置の対応',
		summary: '出力文字列を組み立て、生成した位置と元のソースの位置を対応させます。',
	},
	'kernel/output/emitter/tests': {
		title: 'コードの出力と位置の対応のテスト',
		summary:
			'ソースマップの数値の符号化が仕様の例と一致すること、写した部分と引用符の中の位置が元へ戻ること、ソースマップが位置の問い合わせと同じ答えを返すことを確かめます。',
	},
	'kernel/output/edits': {
		title: '元の文への編集',
		summary: '元の文字列への挿入と削除を集め、一度にまとめて適用します。',
	},
	'kernel/output/edits/tests': {
		title: '元の文への編集のテスト',
		summary:
			'編集が順に適用されること、削除した文字列の位置を後の挿入に予約しないことを確かめます。',
	},
	'kernel/output/structured_data': {
		title: 'JSON の書き出し',
		summary: '文字列、数値、配列、オブジェクトを、値の木を作らずに JSON で書き出します。',
	},
	'kernel/output/structured_data/tests': {
		title: 'JSON の書き出しのテスト',
		summary:
			'文字列を一文字ずつエスケープすること、JSON で表せない小数を null にすること、深い入れ子とキーを書き出せることを確かめます。',
	},
	'kernel/task_files': {
		title: 'タスクの出力ファイル',
		summary: 'タスクが文書ごとに残すファイルの名前と中身を決め、診断を JSON で書き出します。',
	},
	'kernel/performance/measurement': {
		title: '処理時間とメモリの計測',
		summary: '処理ごとの時間と、メモリ割り当ての回数・大きさを測ります。',
	},
	'kernel/performance/measurement/imp/tests': {
		title: '処理時間とメモリの計測のテスト',
		summary: '終了したスレッドの計測値が、集計を取り出すまで残ることを確かめます。',
	},
	'kernel/performance/buffer_pool': {
		title: '作業用メモリの再利用',
		summary: '処理が終わった配列の領域を、同じスレッドの次の文書で使い回します。',
	},
	'kernel/performance/buffer_pool/tests': {
		title: '作業用メモリの再利用のテスト',
		summary:
			'同じスレッドで領域が再利用されること、持ち主の違う領域を渡さないこと、上限を超えた領域を解放することを確かめます。',
	},
};

export function moduleDescription(key: string) {
	const description = moduleDescriptions[key];
	if (!description) throw new Error(`Missing reader description for ${key}`);
	return description;
}
