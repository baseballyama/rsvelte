<script>
	export let item;
	export let activeId;
	let flag = true;
</script>

<!-- In legacy mode `build_expression` wraps a member/call/assignment chunk in
     `(deps…, $.untrack(…))`, and `scope.evaluate` has no SequenceExpression
     case — so none of these three folds, however constant the source reads. -->
<div style="margin-bottom:{item.id === activeId ? '0px' : '0px'};"></div>
<p class="base {item.id === activeId ? 'on' : 'on'}"></p>
<b>{item.id === activeId ? 'same' : 'same'}</b>

<!-- The control: no member, no call, no assignment, so `build_expression`
     returns the value untouched and the chunk really does fold. -->
<i>{flag ? 'lit' : 'lit'}</i>
