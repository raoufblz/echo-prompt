// theme toggle
let darkmode = localStorage.getItem('darkmode') === 'active'; // if true => dark mode on
const themeIcon = document.getElementById('themeIcon'); 


const enableDarkmode = () => {
    document.body.classList.add('darkmode');
    localStorage.setItem('darkmode', 'active');         // keep the mode saved in the localStorage
    themeIcon.textContent = 'light_mode';              // swap icon to sun
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

// themetogglebtn logic
document.getElementById('themeToggleBtn').addEventListener('click', () => {
    if (document.body.classList.contains('darkmode')) {
        disableDarkmode();
    } else {
        enableDarkmode();
    }
});
