<ShoppingCart bind:this={cart}/>

<button on:click={() => cart.empty()}>
	Empty shopping cart
</button>
