//i hope i could make this lmao


// need to repair this

const prompt_container = document.querySelector(".state");
const createbtn = document.querySelector("#save");
const prompt_content = document.getElementById("prompt-content");

createbtn.addEventListener("click", ()=> {
let inputbox = document.createElement("p");
inputbox.className = "input-box";
inputbox.setAttribute("contenteditable" , "true");
inputbox.textContent = prompt_content.innerText; // i think this is for all the text
prompt_container.appendChild(inputbox)
});

const tabs = document.querySelectorAll('.tab'); 
const all_content = document.querySelectorAll('.tab-content');

tabs.forEach((tab,index)=>{
tab.addEventListener('click', (e)=>{
        tabs.forEach(tab=>{tab.classList.remove('active')});
        tab.classList.add('active');
   
all_content.forEach(content =>{content.classList.remove('active')});
all_content[index].classList.add('active');
})

})


