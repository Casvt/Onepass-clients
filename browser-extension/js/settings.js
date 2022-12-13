function saveSettings() {
	const url = document.getElementById('url-input').value.replace(/\/+$/, '');
	localStorage.setItem('base_url', url);
	window.location.href = 'login.html';
};

function saveShortcut(e) {
	if (e.key === 'Enter') {
		saveSettings();
	};
};

// code run on load

const base_url = localStorage.getItem('base_url');
if (base_url !== null) {
	document.getElementById('url-input').value = base_url;
}

document.getElementById('settings-submit').addEventListener('click', e => saveSettings());
document.getElementById('settings-form').addEventListener('keydown', e => saveShortcut(e));