//i hope i could make this lmao

const prompt_container = document.querySelector(".container");
const createbtn = document.querySelector(".tab");

createbtn.addEventListener("click", ()=> {
    let inputbox = document.createElement("p");
    inputbox.className = "input-box";
    inputbox.setAttribute("contenteditable" , "true");
    prompt_container.appendChild(inputbox)
})
