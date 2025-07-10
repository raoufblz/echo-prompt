let darkmode = localStorage.getItem('darkmode') === 'active';
const themeToggleBtn = document.getElementById('themeToggleBtn');

const enableDarkmode = () => {
    document.body.classList.add('darkmode');
    localStorage.setItem('darkmode', 'active');
    themeToggleBtn.textContent = '☀️'; 
}

const disableDarkmode = () => {
    document.body.classList.remove('darkmode');
    localStorage.setItem('darkmode', null);
    themeToggleBtn.textContent = '🌙'; 
}

if (darkmode) {
    enableDarkmode();
} else {
    disableDarkmode();
}

themeToggleBtn.addEventListener("click", () => {
    if (document.body.classList.contains('darkmode')) {
        disableDarkmode();
    } else {
        enableDarkmode();
    }
});
