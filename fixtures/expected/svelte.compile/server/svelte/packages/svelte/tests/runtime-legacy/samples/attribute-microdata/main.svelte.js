import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<div itemscope="" itemtype="https://schema.org/SoftwareApplication"><span itemprop="name">Game</span> - REQUIRES <span itemprop="operatingSystem">OS</span><br/> <link itemprop="applicationCategory" href="https://schema.org/GameApplication"/> <div itemprop="aggregateRating" itemscope="" itemtype="https://schema.org/AggregateRating">RATING: <span itemprop="ratingValue">4.6</span> ( <span itemprop="ratingCount">8864</span> ratings )</div> <div itemref="offers"></div></div> <div itemprop="offers" itemid="offers" id="offers" itemscope="" itemtype="https://schema.org/Offer">Price: $<span itemprop="price">1.00</span> <meta itemprop="priceCurrency" content="USD"/></div>`);
}