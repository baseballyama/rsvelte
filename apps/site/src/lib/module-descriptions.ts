export const moduleDescriptions: Record<string, { title: string; summary: string }> = {
	'kernel/source': { title: 'ソースの記録', summary: '位置、名前、字句、構文木の識別番号を扱う機能をまとめます。' },
	'kernel/computation': { title: '計算と実行', summary: '計算結果の保存と、処理の登録・実行をまとめます。' },
	'kernel/diagnostics': { title: '問題の報告', summary: '検査ルールと、エラーや警告の情報をまとめます。' },
	'kernel/output': { title: '文字列の出力', summary: 'コードの整形、位置の対応、構造化データの出力をまとめます。' },
	'kernel/performance': { title: '性能の計測と改善', summary: '時間とメモリの計測、作業用の保存領域の再利用をまとめます。' },
	'kernel/output/width': { title: '文字の表示幅', summary: '文字が画面で占める幅を、公式の整形ツールと同じ規則で計算します。' },
	'kernel/source/positions': { title: 'ソース内の位置', summary: '文字列内の範囲と、バイト位置・行・列の変換を扱います。' },
	'kernel/source/interning': { title: '名前の保存と共有', summary: '同じ名前を一度だけ保存し、番号で参照します。' },
	'kernel/source/tokens': { title: '字句の記録', summary: '空白やコメントを含め、元のソースの文字列を保持します。' },
	'kernel/computation/database': { title: '計算結果の保存と再利用', summary: '構文解析などの結果を文書ごとに保存し、複数の処理で共有します。' },
	'kernel/source/index': { title: '型付きの識別番号', summary: '構文木の各要素を番号で参照し、その要素に対応する解析結果を保存します。' },
	'kernel/computation/pipeline': { title: '処理の登録と実行', summary: '処理を登録し、文書を並列に処理して結果を返します。' },
	'kernel/diagnostics/diagnostic': { title: 'エラーや警告の情報', summary: '問題の種類、メッセージ、ソース内の位置を記録します。' },
	'kernel/diagnostics/rules': { title: 'コードの問題の検査', summary: '検査ルールを実行し、指摘の並び順を決めます。' },
	'kernel/output/document': { title: 'コードの整形', summary: '改行と字下げの指示を組み合わせ、指定した幅に合わせて文字列を作ります。' },
	'kernel/output/emitter': { title: 'コードの出力と位置の対応', summary: '出力文字列を組み立て、生成した位置と元のソースの位置を対応させます。' },
	'kernel/output/structured_data': { title: '構造化データの書き出し', summary: '文字列・数値・配列・オブジェクトを、直接テキスト形式に書き出します。' },
	'kernel/performance/measurement': { title: '処理時間とメモリの計測', summary: '処理ごとの時間と、メモリ割り当ての回数・大きさを測ります。' },
	'kernel/performance/buffer_pool': { title: '作業用メモリの再利用', summary: '処理が終わった配列の保存領域を、次の文書の処理で使い回します。' },
	'kernel/source/hashing': { title: 'ハッシュ値の計算', summary: '入力文字列から、公式ツールと同じ識別用のハッシュ値を作ります。' }
};

export function moduleDescription(key: string) {
	const description = moduleDescriptions[key];
	if (!description) throw new Error(`Missing reader description for ${key}`);
	return description;
}
