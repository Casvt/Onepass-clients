function logout() {
	fetch(`${base_url}/api/auth/logout?api_key=${api_key}`, {
		'method': 'POST'
	})
	.then(response => {
		localStorage.removeItem('api_key');
		localStorage.removeItem('exp');
		window.location.href = 'login.html';
	});
}

function buildVault(json) {
	const table = document.getElementById('vault');
	table.innerHTML = '';
	for (i=0; i<json.length; i++) {
		const obj = json[i];
		const entry = document.createElement('div');
		entry.classList.add('password-entry');
		entry.id = obj.id;

		const info_container = document.createElement('div');
		entry.appendChild(info_container);

		const title = document.createElement('h2');
		title.innerText = obj.title;
		info_container.appendChild(title);

		const username = document.createElement('p');
		username.innerText = obj.username;
		info_container.appendChild(username);

		const fill_button = document.createElement('button');
		fill_button.classList.add('fill-button');
		fill_button.innerText = 'Fill in';
		fill_button.addEventListener('click', e => fillFields(obj.id));
		entry.append(fill_button);

		table.appendChild(entry);
	}
}

function search() {
	const query = document.getElementById('search-input').value;
	fetch(`${base_url}/api/vault/search?query=${query}&api_key=${api_key}`)
	.then(response => {
		// catch errors
		if (!response.ok) {
			return Promise.reject(response.ok);
		}
		return response.json();
	})
	.then(json => {
		buildVault(json.result);
	})
	.catch(e => {
		if (e === 401) {
			window.location.href = 'login.html';
		};
	});
};

function searchShortcut(e) {
	if (e.key === 'Enter') {
		search();
	};
};

function fillVault() {
	fetch(`${base_url}/api/vault?api_key=${api_key}`)
	.then(response => {
		// catch errors
		if (!response.ok) {
			return Promise.reject(response.status);
		};
		return response.json();
	})
	.then(json => {
		buildVault(json.result)
	})
	.catch(e => {
		if (e === 401) {
			window.location.href = 'login.html';
		};
	});
};

function cancelSearch() {
	fillVault();
	document.getElementById('search-input').value = '';
};

function insertValues(username, password) {
	const event = new Event('input');
	const username_input = document.querySelectorAll('input[type="email"], input[id*="username"], input[id*="login"], input[name*="username"], input[name*="login"], input[class*="username"]')
	if (username_input.length !== 0 && username !== null) {
		username_input[0].value = username;
		username_input[0].dispatchEvent(event);
	};
	const password_input = document.querySelectorAll('input[type="password"], input[id*="password"], input[class*="password"]')
	if (password_input.length !== 0 && password !== null) {
		password_input[0].value = password;
		password_input[0].dispatchEvent(event);
	};
}

function fillFields(id) {
	fetch(`${base_url}/api/vault/${id}?api_key=${api_key}`)
	.then(response => {
		// catch errors
		if (!response.ok) {
			return Promise.reject(response.status);
		};
		return response.json();
	})
	.then(json => {
		chrome.tabs.query({active: true, currentWindow: true}).then(tab => {
			chrome.scripting.executeScript({
				target: { tabId: tab[0].id},
				func: insertValues,
				args: [json.result.username, json.result.password]
			});
		});
	})
	.catch(e => {
		if (e === 401) {
			window.location.href = 'login.html';
		};
	});
};

// code run on load

const base_url = localStorage.getItem('base_url');
if (base_url === null) {
	window.location.href = 'settings.html';
};
const api_key = localStorage.getItem('api_key');
if (
	api_key === null // api_key not set
	|| localStorage.getItem('exp') < Date.now() / 1000 // api_key expired
) {
	window.location.href = 'login.html';
};

fillVault();

document.getElementById('nav-button').addEventListener('click', e => logout());
document.getElementById('search-submit').addEventListener('click', e => search());
document.getElementById('search-input').addEventListener('keydown', e => searchShortcut(e));
document.getElementById('search-cancel').addEventListener('click', e => cancelSearch());
chrome.tabs.query({active: true, currentWindow: true}).then(tab => {
	const url = new URL(tab[0].url);
	document.getElementById('search-input').value = url.origin + url.pathname;
	search();
});
