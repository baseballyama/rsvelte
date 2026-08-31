<!--
  esrap flushes a rebuilt statement's leading comments at the first LOCATED node
  inside it, and only a SPLIT declaration is rebuilt. `a` (two declarators) must
  therefore print its comment AFTER the keyword, while `solo` (one declarator)
  keeps the source statement's own `loc` and prints it BEFORE. Both halves have
  to hold: a fix that moves every prop declaration's comment breaks the second,
  and it is the prop lowering — which rebuilds the declaration from its own text
  — that has to carry the moved comment through. A comment sharing the
  declarator's line was written there and keeps that line, so the same peel has
  to tell the two apart rather than strip both. The SSR output is a second port
  of the same decision and is compared here too: it assembles the component from
  re-parsed slices and registers a comment region per statement, so the rule
  lives in where that region is anchored rather than in a text peel.
-->
<script>
	// lead line
	export let a = [],
		b = 2;

	/* lead block */
	export let c = 3,
		d = 4;

	// one
	// two
	export let e = 5,
		f = 6;

	// solo stays put
	export let solo = 7;

	export let /* same line */ g = 8,
		h = 9;
</script>

{a}{b}{c}{d}{e}{f}{solo}{g}{h}
