// this code is not used 
(() => { 
  try {
    let form = document.getElementsByClassName("POSTFORM")[0];
    let csrfToken = document.getElementsByName("_csrf")[0].value;
    if (form.id == "EDIT" || form.id == "DELETE") {
      form.addEventListener('submit', (e)=>{
        e.preventDefault();
        let formData = new FormData(form);
        fetch(form.action, {
          method: form.id,
          cache: "no-cache", 
          credentials: "same-origin", 
          redirect: "manual",
          headers: {
            'CSRF-token': csrfToken
          },
          body: formData, 
          })
          .then(response => {
            window.location.href = response.url;
          })
          .catch((error)=>{
            console.log(error);
          })
      })
    }
  }
  catch (error) {
    console.log("no edit/delete form on this page");
  }
})();