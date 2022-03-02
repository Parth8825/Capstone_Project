
function detailSubmit(){
    return true;
    var result = '';
    var errors = '';

    var firstname = document.getElementById('firstname').value;
    var lastname = document.getElementById('lastname').value;
    var email = document.getElementById('email').value;
    var phone = document.getElementById('phone').value;
    var address = document.getElementById('address').value;
    var postcode = document.getElementById('postcode').value;
    var position = document.getElementById('position').value;
    var payRate = document.getElementById('payrate').value;
    var name = firstname + " " + lastname;
    var postcoderegex = /^[A-Z][0-9][A-Z]\s[0-9][A-Z][0-9]$/;

    // Converting the postcode to uppercase before testing
    postcode = postcode.toUpperCase(); 

    // Testing if the postcode fits the pattern
    if(postcoderegex.test(postcode)){ // Returns true if postcode satisfies the pattern
        errors += ''; // No error in postcode
    }
    else{
        errors += 'Post code is not in correct format <br/>'; // Error found in postcode
    }

    if(errors.trim() != ''){ // trim is the function that trims any empty spaces from front or back
        // Showing the errors
        document.getElementById('errors').innerHTML = errors + '-- Please fix the above errors --';
        document.getElementById('errors').style.border = '2px dashed white';
    }
    else{
        document.getElementById('massege').innerHTML = errors + 'Employee Data successfully saved';
       
    }
    return true;// this will allow the form to be submitted if there are no errors
    result = "Employee Name: " + name + "<br>" +
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
    return false;
}
    
