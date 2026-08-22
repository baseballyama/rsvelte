<script module>
	let mo = { a: 1 };

	class MK {
		field = $state.snapshot(mo);
		static stat = $state.snapshot(mo);
	}

	let m_single = $state.snapshot(mo);
	let m_y = 0, m_later = $state.snapshot(mo);
	const m_held = { p: $state.snapshot(mo) };
</script>

<script>
	let io = { a: 1 };

	class IK {
		field = $state.snapshot(io);
	}

	let i_single = $state.snapshot(io);
	let i_y = 0, i_later = $state.snapshot(io);
	const ik = new IK();
	const mk = new MK();
</script>

<div>
	{m_single.a}{m_y}{m_later.a}{m_held.p.a}{mk.field.a}{MK.stat.a}
	{i_single.a}{i_y}{i_later.a}{ik.field.a}
</div>
