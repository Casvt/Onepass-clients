function login() {
	const data = {
		'username': document.getElementById('username-input').value,
		'master_password': document.getElementById('password-input').value
	};
	fetch(`${base_url}/api/auth/login`, {
		'method': 'POST',
		'body': JSON.stringify(data),
		'headers': {'Content-Type': 'application/json'}
	})
	.then(response => {
		// catch errors
		if (!response.ok) {
			return Promise.reject(response.status);
		};

		var el = document.getElementById('username-error');
		el.classList.add('hidden');
		el.setAttribute('aria-hidden','true');
		var el = document.getElementById('password-error');
		el.classList.add('hidden');
		el.setAttribute('aria-hidden','true');

		return response.json();
	})
	.then(json => {
		localStorage.setItem('api_key', json.result.api_key);
		localStorage.setItem('exp', json.result.expires);
		window.location.href = 'vault.html';
	})
	.catch(e => {
		if (e === 404) {
			var el = document.getElementById('username-error');
			el.innerText = '*Username not found';
			el.classList.remove('hidden');
			el.setAttribute('aria-hidden','false');
			var el = document.getElementById('password-error');
			el.classList.add('hidden');
			el.setAttribute('aria-hidden','true');
		} else if (e === 401) {
			var el = document.getElementById('password-error');
			el.innerText = '*Password incorrect';
			el.classList.remove('hidden');
			el.setAttribute('aria-hidden','false');
			var el = document.getElementById('username-error');
			el.classList.add('hidden');
			el.setAttribute('aria-hidden','true');
		};
	});
};

function loginShortcut(e) {
	if (e.key === 'Enter') {
		login();
	};
};

// code run on load

const base_url = localStorage.getItem('base_url');
if (base_url === null) {
	window.location.href = 'settings.html';
};

document.getElementById('login-submit').addEventListener('click', e => login());
document.getElementById('login-form').addEventListener('keydown', e => loginShortcut(e));