document.getElementById("changeLink").onclick = function() {
  var getConfirmation = confirm("Please select OK to Delete record");
  if(getConfirmation){
    let link = "/delete/<%= employee._id %>";
    document.getElementById("changeLink").href = link;
  }
  else{
    let link = "/";
    document.getElementById("changeLink").href = link;
  }
}
