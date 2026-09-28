export const call = {
	name: '関数呼び出し',
	width: 20,
	src: `group(
  "f(",
  indent([softline, join([",", line], ["alpha", "beta", "gamma"])]),
  softline,
  ")"
)`
};

export const fill = {
	name: 'fill',
	width: 24,
	src: `fill(join(line, ["Svelte", "の", "ツールチェーン", "を", "ひとつ", "の", "カーネル", "で", "動かす"]))`
};

export const groupIds = {
	name: 'group id',
	width: 30,
	src: `[
  groupId("args", "call(", indent([softline, "argument_one,", line, "argument_two"]), softline, ")"),
  ifBreakOf("args", " // 改行した", " // 1 行")
]`
};

export const flatOnly = {
	name: 'flat_only',
	width: 30,
	src: `["type Props = ", flatOnly(["{ label: string;", line, "count: number }"])]`
};

export const remeasure = {
	name: 'hardline',
	width: 40,
	src: `group([
  "{",
  indent([line, "a", hardline, "b"]),
  line,
  "}",
  group(["(", softline, "c", ")"])
])`
};

export const mustBeFlat = {
	name: 'mustBeFlat',
	width: 80,
	src: `fill([groupBroken(["a", line, "b"]), line, "c"])`
};
