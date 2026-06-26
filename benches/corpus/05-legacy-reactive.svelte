<script>
	import { writable } from 'svelte/store';
	import { createEventDispatcher } from 'svelte';

	export let title = 'Cart';
	export let taxRate = 0.1;

	const dispatch = createEventDispatcher();
	const coupon = writable('');

	let items = [
		{ id: 1, name: 'Widget', price: 9.99, qty: 1 },
		{ id: 2, name: 'Gadget', price: 19.5, qty: 2 },
		{ id: 3, name: 'Gizmo', price: 4.25, qty: 5 }
	];

	$: subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
	$: discount = $coupon === 'SAVE10' ? subtotal * 0.1 : 0;
	$: tax = (subtotal - discount) * taxRate;
	$: total = subtotal - discount + tax;
	$: itemCount = items.reduce((n, item) => n + item.qty, 0);

	$: if (total > 100) {
		console.log('Big order:', total);
	}

	function changeQty(id, delta) {
		items = items.map((item) =>
			item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
		);
	}

	function checkout() {
		dispatch('checkout', { items, total });
	}
</script>

<div class="cart">
	<h2>{title} ({itemCount})</h2>

	<ul>
		{#each items as item (item.id)}
			<li>
				<span class="name">{item.name}</span>
				<span class="price">${item.price.toFixed(2)}</span>
				<span class="qty">
					<button on:click={() => changeQty(item.id, -1)}>−</button>
					{item.qty}
					<button on:click={() => changeQty(item.id, 1)}>+</button>
				</span>
				<span class="line">${(item.price * item.qty).toFixed(2)}</span>
			</li>
		{/each}
	</ul>

	<label class="coupon">
		Coupon
		<input bind:value={$coupon} placeholder="Try SAVE10" />
	</label>

	<dl class="totals">
		<dt>Subtotal</dt>
		<dd>${subtotal.toFixed(2)}</dd>
		{#if discount > 0}
			<dt>Discount</dt>
			<dd>−${discount.toFixed(2)}</dd>
		{/if}
		<dt>Tax</dt>
		<dd>${tax.toFixed(2)}</dd>
		<dt class="grand">Total</dt>
		<dd class="grand">${total.toFixed(2)}</dd>
	</dl>

	<button class="checkout" on:click={checkout} disabled={itemCount === 0}>
		Checkout
	</button>
</div>

<style>
	.cart {
		max-width: 30rem;
	}

	ul {
		list-style: none;
		padding: 0;
	}

	li {
		display: grid;
		grid-template-columns: 1fr auto auto auto;
		gap: 0.5rem;
		align-items: center;
	}

	.totals .grand {
		font-weight: 700;
	}
</style>
