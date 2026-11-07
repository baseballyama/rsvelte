import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import "./example-card.css";

var root = $.from_html(`<div class="login-container"><div class="login-card"><h1 class="login-title">Login</h1> <p class="login-subtitle">Please enter your credentials to continue</p> <form class="login-form"><div class="form-group"><label for="field-email">Email</label> <input id="field-email" type="email" placeholder="Enter your email" required=""/></div> <div class="form-group"><label for="field-password">Password</label> <input id="field-password" type="password" placeholder="Enter your password" required=""/></div> <div class="form-actions"><button type="submit" class="login-button">Sign In</button></div> <div class="form-footer"><a href="##" class="forgot-password">Forgot password?</a></div></form></div></div>`);

export default function Example_card($$anchor) {
	var div = root();

	$.append($$anchor, div);
}