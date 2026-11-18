<script>
	let hex = 0x1f;
	let oct = 0o755;
	let bin = 0b1;
	let big = 1n;
	let sep = 1_000;
	let nul = '\0';
	let esc = '\\251';
	let names = { static: 1, let: 2, private: 3, interface: 4 };
	let read = names.static + names.let + names.private + names.interface;
	let proto = { __proto__: 1 };
	let __proto__ = 2;
	let shorthand = { __proto__, other: 3 };
	let accessor = { get __proto__() { return 1; }, __proto__: 4 };
	let o = { a: 1 };
	delete o.a;

	function shadow(a) {
		function inner(a) {
			return a;
		}
		return inner(a);
	}

	function counted() {
		return arguments.length;
	}

	const tag = (s) => s.raw[0];
	let tagged = tag`\251`;

	class C {
		static m() {
			return 1;
		}
	}
</script>

<b>{hex}{oct}{bin}{big}{sep}{nul}{esc}{read}</b>
<i>{proto.__proto__}{shorthand.other}{accessor.__proto__}</i>
<u>{shadow(1)}{counted()}{tagged}{C.m()}</u>
