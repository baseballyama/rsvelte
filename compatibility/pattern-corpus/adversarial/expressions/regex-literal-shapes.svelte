<script>
  let v = $state("a/b");

  const slashInClass = /[/]/;
  const escapedSlash = /a\/b/;
  const flags = /x/gimsuy;
  const named = /(?<group>a)/;
  const lookahead = /a(?=b)/;
  const lookbehind = /(?<=a)b/;
  const unicodeProp = /\p{Letter}/u;
  const braceInside = /[{}]/;
  const divisionNotRegex = 10 / 2 / 1;
  const afterParen = (1 + 2) / 3;
</script>

<b>{slashInClass.test(v)}{escapedSlash.test(v)}</b>
<b>{flags.source}{named.source}</b>
<b>{lookahead.source}{lookbehind.source}</b>
<b>{unicodeProp.source}{braceInside.source}</b>
<b>{divisionNotRegex}{afterParen}</b>
