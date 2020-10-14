const PageManager = (function(){
    var pages = document.querySelectorAll(".page");
    const urlToPage = {

    }
    pages.forEach(element => {
        urlToPage[element.dataset["page"]]=element;
    });
    function closeAllPage(){
        pages.forEach(element => {
            element.style.display="none";
        });
    }
    window.addEventListener("hashchange",function(){
        closeAllPage();
        console.log(location.hash.slice(1));
        urlToPage[location.hash.slice(1)].style.display="block";
    })
})();