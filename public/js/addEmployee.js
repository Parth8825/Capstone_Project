
function detailSubmit(){
    return true;
    var result = '';
    var errors = '';

    var employeeName = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var phone = document.getElementById('phone').value;
    var time = document.getElementsByName('time');
    var address = document.getElementById('address').value;
    var postcode = document.getElementById('postcode').value;
    var position = document.getElementById('position').value;
    var payRate = document.getElementById('payrate').value;
    var whatTime = "";
    var timeIndex = -1;
    for(var i = 0; i< time.length; i++){
        if(time[i].checked){
            timeIndex = i; // storing the index that the user selected
            break;
        }
    }
     // Checking if any of the radio buttons was selected
     if(timeIndex > -1){
        whatTime = time[timeIndex].value;
    }
    else{
        // User did not select any value for lunch so concatenating that error to the list
        errors += 'You did not select any value between full time or part time<br/>';
    }

    if(errors.trim() != ''){ // trim is the function that trims any empty spaces from front or back
        // Showing the errors
        document.getElementById('errors').innerHTML = errors + '-- Please fix the above errors --';
        document.getElementById('errors').style.border = '2px dashed white';
    }
    else{

        return true;// this will allow the form to be submitted if there are no errors
        result = "Employee Name: " + employeeName + "<br>" +
                 "Email: " + email +"<br>" +
                 "phone: " + phone +"<br>" +
                 "Address: " + address +"<br>" +
                 "Full or Part Time: " + whatTime +"<br>" +
                 "Postal Code: " + postcode +"<br>" +
                 "Position: " + position +"<br>" +
                 "Payrate: " + payRate;

        // removing any err
        document.getElementById('errors').innerHTML = '';
        document.getElementById('errors').style.border = '0px';
        document.getElementById('employeeDetail').innerHTML = result;
    }
    return false;
}
    
