let darkmode = localStorage.getItem('darkmode') === 'active';
const themeIcon = document.getElementById('themeIcon');

const enableDarkmode = () => {
    document.body.classList.add('darkmode');
    localStorage.setItem('darkmode', 'active');
    themeIcon.textContent = 'light_mode';
}

const disableDarkmode = () => {
    document.body.classList.remove('darkmode');
    localStorage.setItem('darkmode', null);
    themeIcon.textContent = 'dark_mode';
}

if (darkmode) {
    enableDarkmode();
} else {
    disableDarkmode();
}

document.getElementById('themeToggleBtn').addEventListener('click', () => {
    if (document.body.classList.contains('darkmode')) {
        disableDarkmode();
    } else {
        enableDarkmode();
    }
});
