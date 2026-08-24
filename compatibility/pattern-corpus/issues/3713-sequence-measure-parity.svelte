<!-- Where esrap breaks a sequence is decided by a 60-column measure, and this
     port's disagreed with it in two directions at once. Every declaration below
     is an item count that landed inside the window one of the two offsets
     opened. The explanations are markup comments rather than JS ones because a
     comment inside the script takes the sequence layout down a different path
     (see the Rust test, which covers both).

     `pairs`, `objects`, `triples` and `calls`: a child that writes its own
     inter-item space. esrap counts that space as text; this port modelled it as
     a layout event and subtracted it, so a child was measured short by exactly
     the spaces it wrote.

     `wide`/`twin` and `astral`/`astralTwin`: a character costs its UTF-16 length
     to esrap and cost its UTF-8 byte length here. Each pair has the same UTF-16
     width and a different byte width, so a byte count disagrees about them and a
     unit count does not.

     `plain7` and `plain21`: the controls. A child with no inner space is measured
     identically either way, at counts on both sides of the threshold. -->
<script>
	function f(a, b) {
		return a + b;
	}

	const pairs = [[5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0]];
	const objects = [{ a: 0, b: 0 }, { a: 1, b: 0 }, { a: 2, b: 0 }, { a: 3, b: 0 }];
	const triples = [[0, 0, 1], [1, 0, 1], [2, 0, 1], [3, 0, 1], [4, 0, 1], [5, 0, 1]];
	const calls = [f(0, 0), f(1, 0), f(2, 0), f(3, 0), f(4, 0), f(5, 0), f(6, 0)];
	const wide = [{ c: "✈️", k: 0 }, { c: "✈️", k: 1 }, { c: "✈️", k: 2 }];
	const twin = [{ c: "xxx", k: 0 }, { c: "xxx", k: 1 }, { c: "xxx", k: 2 }];
	const astral = [{ c: "𝄞", k: 0 }, { c: "𝄞", k: 1 }, { c: "𝄞", k: 2 }, { c: "𝄞", k: 3 }];
	const astralTwin = [{ c: "xx", k: 0 }, { c: "xx", k: 1 }, { c: "xx", k: 2 }, { c: "xx", k: 3 }];
	const plain7 = [0, 1, 2, 3, 4, 5, 6];
	const plain21 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
</script>

<p>{pairs.length + objects.length + triples.length + calls.length}</p>
<p>{wide.length + twin.length + astral.length + astralTwin.length}</p>
<p>{plain7.length + plain21.length}</p>
