import { bilingual, type Lang } from './i18n.ts';

type Text = Record<Lang, string>;

export const moduleDescriptions: Record<string, { title: Text; summary: Text }> = {
	'kernel/source': { title: bilingual('ソースの記録', 'Source records'), summary: bilingual('位置、名前、字句、構文木の識別番号を扱う機能をまとめます。', 'Groups the code for positions, names, tokens, and identifiers of syntax tree elements.') },
	'kernel/computation': { title: bilingual('計算と実行', 'Computation and runs'), summary: bilingual('計算結果の保存と、処理の登録・実行をまとめます。', 'Groups the store for computed results and the registration and running of work.') },
	'kernel/diagnostics': { title: bilingual('問題の報告', 'Problem reports'), summary: bilingual('どのタスクも使う、エラーや警告の情報をまとめます。', 'Groups the error and warning information that every task uses.') },
	'kernel/output': { title: bilingual('文字列の出力', 'Text output'), summary: bilingual('コードの整形、位置の対応、構造化データの出力をまとめます。', 'Groups code formatting, position mapping, and structured data output.') },
	'kernel/performance': { title: bilingual('性能の計測と改善', 'Performance measurement and tuning'), summary: bilingual('時間とメモリの計測、作業用の保存領域の再利用をまとめます。', 'Groups time and memory measurement, and the reuse of working storage.') },
	'kernel/output/width': { title: bilingual('文字の表示幅', 'Display width of text'), summary: bilingual('文字が画面で占める幅を、Unicode の幅の規則で計算します。', 'Computes how wide a character is on screen, with the Unicode width rules.') },
	'kernel/source/positions': { title: bilingual('ソース内の位置', 'Positions in the source'), summary: bilingual('文字列内の範囲と、バイト位置・行・列の変換を扱います。', 'Handles ranges in a text, and converts between byte positions, lines, and columns.') },
	'kernel/source/interning': { title: bilingual('名前の保存と共有', 'Storing and sharing names'), summary: bilingual('同じ名前を一度だけ保存し、番号で参照します。', 'Stores each name only once and refers to it by a number.') },
	'kernel/source/tokens': { title: bilingual('字句の記録', 'Token records'), summary: bilingual('空白やコメントを含め、元のソースの文字列を保持します。', 'Keeps the text of the original source, including whitespace and comments.') },
	'kernel/computation/database': { title: bilingual('計算結果の保存と再利用', 'Storing and reusing computed results'), summary: bilingual('構文解析などの結果を文書ごとに保存し、複数の処理で共有します。', 'Stores results such as parse results for each document and shares them between tasks.') },
	'kernel/source/index': { title: bilingual('型付きの識別番号', 'Typed identifiers'), summary: bilingual('構文木の各要素を番号で参照し、その要素に対応する解析結果を保存します。', 'Refers to each element of a syntax tree by a number, and stores the analysis results for that element.') },
	'kernel/computation/pipeline': { title: bilingual('処理の登録と実行', 'Registering and running work'), summary: bilingual('処理を登録し、文書を並列に処理して結果を返します。', 'Registers work, processes documents in parallel, and returns the results.') },
	'kernel/computation/pipeline/tests': { title: bilingual('処理の登録と実行のテスト', 'Tests for registering and running work'), summary: bilingual('文書ごとの処理と、全文書の結果をまとめる処理に渡る値を確かめます。', 'Checks the values that reach the work for each document and the work that combines the results of all documents.') },
	'kernel/computation/pipeline/tests/plugins': { title: bilingual('実行前のプラグイン検査のテスト', 'Tests for the plugin check before a run'), summary: bilingual('依存関係が正しくなければ、二つの実行の入口がどちらも処理を始める前に止まることを確かめます。', 'Checks that both ways to start a run stop before any work starts when the dependencies are wrong.') },
	'kernel/computation/functions': { title: bilingual('型を決めた関数', 'Typed functions'), summary: bilingual('入力と出力の型、名前、版を決めた関数を表し、呼び出しの失敗をエラーとして返します。', 'Represents a function with a fixed input type, output type, name, and version, and returns a failed call as an error.') },
	'kernel/computation/functions/tests': { title: bilingual('型を決めた関数のテスト', 'Tests for typed functions'), summary: bilingual('借用した入力を受け取れること、関数を持つ値が生き続けること、エラーがそのまま返ることを確かめます。', 'Checks that a function accepts borrowed input, that the value holding the function stays alive, and that an error comes back unchanged.') },
	'kernel/computation/plugins': { title: bilingual('プラグインの依存関係の検査', 'Plugin dependency check'), summary: bilingual('プラグインの名前、版、依存先を登録し、依存先の不足、版の不一致、循環を処理の前に見つけます。', 'Registers the name, version, and dependencies of each plugin, and finds missing dependencies, version mismatches, and cycles before any work starts.') },
	'kernel/computation/plugins/error': { title: bilingual('プラグインの登録エラー', 'Plugin registration errors'), summary: bilingual('空の名前、正しくない版や版の条件、食い違う登録、依存先の重複・不足・版の不一致、循環を区別して報告します。', 'Reports each case separately: an empty name, an invalid version or version requirement, conflicting registrations, duplicate, missing, or mismatched dependencies, and cycles.') },
	'kernel/computation/plugins/tests': { title: bilingual('プラグインの依存関係の検査のテスト', 'Tests for the plugin dependency check'), summary: bilingual('版の条件が Cargo と同じ規則で判定されること、登録の順で結果が変わらないこと、各エラーが原因の名前を示すことを確かめます。', 'Checks that version requirements follow the same rules as Cargo, that the registration order does not change the result, and that each error names its cause.') },
	'kernel/diagnostics/diagnostic': { title: bilingual('エラーや警告の情報', 'Error and warning information'), summary: bilingual('問題の種類、メッセージ、ソース内の位置を記録します。', 'Records the kind of problem, the message, and the position in the source.') },
	'lint/output': { title: bilingual('検査結果の書き出し', 'Writing lint results'), summary: bilingual('指摘の位置を行と列に直し、検査結果を書き出します。', 'Converts the position of each finding to a line and a column, and writes the lint results.') },
	'lint/rules': { title: bilingual('コードの問題の検査', 'Checking code for problems'), summary: bilingual('検査ルールを実行し、指摘の並び順を決めます。', 'Runs the lint rules and decides the order of the findings.') },
	'kernel/output/document': { title: bilingual('コードの整形', 'Code formatting'), summary: bilingual('改行と字下げの指示を組み合わせ、指定した幅に合わせて文字列を作ります。', 'Combines line break and indentation instructions, and builds text that fits a given width.') },
	'kernel/output/emitter': { title: bilingual('コードの出力と位置の対応', 'Code output and position mapping'), summary: bilingual('出力文字列を組み立て、生成した位置と元のソースの位置を対応させます。', 'Builds the output text, and maps each generated position to a position in the original source.') },
	'kernel/output/structured_data': { title: bilingual('構造化データの書き出し', 'Writing structured data'), summary: bilingual('文字列・数値・配列・オブジェクトを、直接テキスト形式に書き出します。', 'Writes strings, numbers, arrays, and objects directly as text.') },
	'kernel/performance/measurement': { title: bilingual('処理時間とメモリの計測', 'Measuring time and memory'), summary: bilingual('処理ごとの時間と、メモリ割り当ての回数・大きさを測ります。', 'Measures the time of each step, and the number and size of memory allocations.') },
	'kernel/performance/buffer_pool': { title: bilingual('作業用メモリの再利用', 'Reusing working memory'), summary: bilingual('処理が終わった配列の保存領域を、次の文書の処理で使い回します。', 'Reuses the storage of arrays from finished work when the next document is processed.') },
	'kernel/source/hashing': { title: bilingual('ハッシュ値の計算', 'Computing hash values'), summary: bilingual('入力文字列から、公式ツールと同じ識別用のハッシュ値を作ります。', 'Computes, from an input text, the same identifying hash value as the official tool.') }
};

export function moduleDescription(key: string) {
	const description = moduleDescriptions[key];
	if (!description) throw new Error(`Missing reader description for ${key}`);
	return description;
}
