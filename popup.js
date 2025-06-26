//i hope i could make this lmao


// need to repair this

// const prompt_container = document.querySelector(".container");
// const createbtn = document.querySelector(".tab");

// createbtn.addEventListener("click", ()=> {
//     let inputbox = document.createElement("p");
//     inputbox.className = "input-box";
//     inputbox.setAttribute("contenteditable" , "true");
//     prompt_container.appendChild(inputbox)
// })


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
