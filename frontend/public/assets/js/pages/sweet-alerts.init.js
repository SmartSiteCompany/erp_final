var saBasic = document.getElementById("sa-basic");
if (saBasic) {
  saBasic.addEventListener("click", function() {
    Swal.fire({title:"Any fool can use a computer",confirmButtonColor:"#038edc"});
  });
}

var saTitle = document.getElementById("sa-title");
if (saTitle) {
  saTitle.addEventListener("click", function() {
    Swal.fire({title:"The Internet?",text:"That thing is still around?",icon:"question",confirmButtonColor:"#038edc"});
  });
}

var saSuccess = document.getElementById("sa-success");
if (saSuccess) {
  saSuccess.addEventListener("click", function() {
    Swal.fire({title:"Good job!",text:"You clicked the button!",icon:"success",showCancelButton:true,confirmButtonColor:"#038edc",cancelButtonColor:"#f34e4e"});
  });
}

var saWarning = document.getElementById("sa-warning");
if (saWarning) {
  saWarning.addEventListener("click", function() {
    Swal.fire({
      title:"Are you sure?",
      text:"You won't be able to revert this!",
      icon:"warning",
      showCancelButton:true,
      confirmButtonColor:"#51d28c",
      cancelButtonColor:"#f34e4e",
      confirmButtonText:"Yes, delete it!"
    }).then(function(e) {
      if (e.value) {
        Swal.fire("Deleted!","Your file has been deleted.","success");
      }
    });
  });
}

var saParams = document.getElementById("sa-params");
if (saParams) {
  saParams.addEventListener("click", function() {
    Swal.fire({
      title:"Are you sure?",
      text:"You won't be able to revert this!",
      icon:"warning",
      showCancelButton:true,
      confirmButtonText:"Yes, delete it!",
      cancelButtonText:"No, cancel!",
      customClass:{confirmButton:"btn btn-success mt-2",cancelButton:"btn btn-danger ms-2 mt-2"},
      buttonsStyling:false
    }).then(function(e) {
      if (e.value) {
        Swal.fire({title:"Deleted!",text:"Your file has been deleted.",icon:"success",confirmButtonColor:"#038edc"});
      } else if (e.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({title:"Cancelled",text:"Your imaginary file is safe :)",icon:"error",confirmButtonColor:"#038edc"});
      }
    });
  });
}

var saImage = document.getElementById("sa-image");
if (saImage) {
  saImage.addEventListener("click", function() {
    Swal.fire({title:"Sweet!",text:"Modal with a custom image.",imageUrl:"/assets/images/logo-sm.png",imageHeight:40,confirmButtonColor:"#038edc",animation:false});
  });
}

var saClose = document.getElementById("sa-close");
if (saClose) {
  saClose.addEventListener("click", function() {
    var e;
    Swal.fire({
      title:"Auto close alert!",
      html:"I will close in <strong></strong> seconds.",
      timer:2000,
      timerProgressBar:true,
      didOpen:function() {
        Swal.showLoading();
        e = setInterval(function() {
          var e = Swal.getHtmlContainer();
          if (e) {
            var t = e.querySelector("b");
            if (t) t.textContent = Swal.getTimerLeft();
          }
        }, 100);
      },
      onClose:function() {
        clearInterval(e);
      }
    }).then(function(e) {
      if (e.dismiss === Swal.DismissReason.timer) {
        console.log("I was closed by the timer");
      }
    });
  });
}

var customHtmlAlert = document.getElementById("custom-html-alert");
if (customHtmlAlert) {
  customHtmlAlert.addEventListener("click", function() {
    Swal.fire({
      title:"<i>HTML</i> <u>example</u>",
      icon:"info",
      html:'You can use <b>bold text</b>, <a href="//Pichforest.in/">links</a> and other HTML tags',
      showCloseButton:true,
      showCancelButton:true,
      confirmButtonClass:"btn btn-success",
      cancelButtonClass:"btn btn-danger ml-1",
      confirmButtonColor:"#47bd9a",
      cancelButtonColor:"#f34e4e",
      confirmButtonText:'<i class="fas fa-thumbs-up me-1"></i> Great!',
      cancelButtonText:'<i class="fas fa-thumbs-down"></i>'
    });
  });
}

var saPosition = document.getElementById("sa-position");
if (saPosition) {
  saPosition.addEventListener("click", function() {
    Swal.fire({position:"top-end",icon:"success",title:"Your work has been saved",showConfirmButton:false,timer:1500});
  });
}

var customPaddingWidthAlert = document.getElementById("custom-padding-width-alert");
if (customPaddingWidthAlert) {
  customPaddingWidthAlert.addEventListener("click", function() {
    Swal.fire({title:"Custom width, padding, background.",width:600,padding:100,confirmButtonColor:"#038edc",background:"#fff url(/assets/images/small/img-1.jpg)"});
  });
}

var ajaxAlert = document.getElementById("ajax-alert");
if (ajaxAlert) {
  ajaxAlert.addEventListener("click", function() {
    Swal.fire({
      title:"Submit email to run ajax request",
      input:"email",
      showCancelButton:true,
      confirmButtonText:"Submit",
      showLoaderOnConfirm:true,
      confirmButtonColor:"#038edc",
      cancelButtonColor:"#f34e4e",
      preConfirm:function(e) {
        return new Promise(function(t,n) {
          setTimeout(function() {
            if (e === "taken@example.com") {
              n("This email is already taken.");
            } else {
              t();
            }
          }, 2000);
        });
      },
      allowOutsideClick:false
    }).then(function(e) {
      Swal.fire({icon:"success",title:"Ajax request finished!",confirmButtonColor:"#038edc",html:"Submitted email: "+e});
    });
  });
}
