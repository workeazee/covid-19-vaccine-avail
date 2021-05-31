$(document).ready(function () {
  var apiCalled = 0;
  var counter = 0;
  var statesResponseData;
  var districtsResponseData;
  var responseData;
  var resultContainer = $("#result");

  if(!localStorage.getItem('lastOpenedState'))
    localStorage.setItem('lastOpenedState', 'Maharashtra');
  if(!localStorage.getItem('lastOpenedDistrict'))
    localStorage.setItem('lastOpenedDistrict', 'Thane');
  if(!localStorage.getItem('viewOnlyAvailable'))
    localStorage.setItem('viewOnlyAvailable', true);

  if(!localStorage.getItem('nage18'))
    localStorage.setItem('nage18', true);
  if(!localStorage.getItem('nage45'))
    localStorage.setItem('nage45', true);
  if(!localStorage.getItem('ndose1'))
    localStorage.setItem('ndose1', true);
  if(!localStorage.getItem('ndose2'))
    localStorage.setItem('ndose2', true);

  var lastOpenedState = localStorage.getItem('lastOpenedState');
  var lastOpenedDistrict = localStorage.getItem('lastOpenedDistrict');
  var viewOnlyAvailable = localStorage.getItem('viewOnlyAvailable') == 'true' ? true : false;
  var nage18 = localStorage.getItem('nage18') == 'true' ? true : false;
  var nage45 = localStorage.getItem('nage45') == 'true' ? true : false;
  var ndose1 = localStorage.getItem('ndose1') == 'true' ? true : false;
  var ndose2 = localStorage.getItem('ndose2') == 'true' ? true : false;
  getStates();

  $("#viewOnlyAvailable").prop("checked", viewOnlyAvailable);
  $("#nage18").prop("checked", nage18);
  $("#nage45").prop("checked", nage45);
  $("#ndose1").prop("checked", ndose1);
  $("#ndose2").prop("checked", ndose2);
  if($("#viewOnlyAvailable").prop("checked")) {
    $("#viewOnlyAvailableLabel").text("View Only Available Slots (toggle to view all slots)");
  }
  else {
    $("#viewOnlyAvailableLabel").text("View Only Available Slots (toggle to view only available slots)");
  }
  document.getElementById("selected-location-states").setAttribute('value', lastOpenedState);
  document.getElementById("selected-location-districts").setAttribute('value', lastOpenedDistrict);

  // Otherwise, we need to ask the user for permission
  if (
    window.Notification &&
    (Notification.permission !== "denied" ||
      Notification.permission === "default")
  ) {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
      }
    });
  }

  var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    $(".notification-title").remove();
    $(".notification-items").remove();
  }

  callApi();
  window.setInterval(function () {
    callApi();
  }, 4000);  
  window.setInterval(function () {
    checkForNotifications();
  }, 60000);

  $('.filter').on("click", function (e) {
    e.preventDefault();
    if ($(this).hasClass("selected"))
      $(this).removeClass("selected");
    else $(this).addClass("selected");
    populateData(responseData);
  });

  $("#reset_all").on("click", function (e) {
    $(".filters-list .filter").removeClass("selected");
    populateData(responseData);
  });

  $("#viewOnlyAvailable").on("click", function (e) {
    populateData(responseData);
    $("#viewOnlyAvailable").prop("checked")?localStorage.setItem('viewOnlyAvailable', true):localStorage.setItem('viewOnlyAvailable', false);
    if($("#viewOnlyAvailable").prop("checked")) {
      $("#viewOnlyAvailableLabel").text("View Only Available Slots (toggle to view all slots)");
    }
    else {
      $("#viewOnlyAvailableLabel").text("View Only Available Slots (toggle to view only available slots)");
    }
  });

  $(".notification-items .form-check-input").on("click", function (e) {
    $(this).prop("checked")?localStorage.setItem(e.target.id, true):localStorage.setItem(e.target.id, false);
    switch(e.target.id){
      case 'ndose1':
        ndose1 = localStorage.getItem('ndose1') == 'true' ? true : false;
        break;
      case 'ndose2':
        ndose2 = localStorage.getItem('ndose2') == 'true' ? true : false;
        break;
      case 'nage18':
        nage18 = localStorage.getItem('nage18') == 'true' ? true : false;
        break;
      case 'nage45':
        nage45 = localStorage.getItem('nage45') == 'true' ? true : false;
        break;
    }
    checkForNotifications();
  });

  function callApi() {
    var today = new Date();
    var date =
      today.getDate() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getFullYear() +
      "   " +
      today.getHours() +
      ":" +
      today.getMinutes() +
      ":" +
      today.getSeconds();
    $("#last-updated-date-time span").text("Updated On: " + date);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        $("#error h3").hide();
        var response = jQuery.parseJSON(this.responseText);
        responseData = response;
        populateData(response);
        return response;
      } else {
        $("#error").show();
      }
    };
    if (districtsResponseData) {
      var url = calendarByDistrictURL + districtsResponseData.districts.find((district) => district.district_name == $("#selected-location-districts").val()).district_id;
      xhttp.open("GET", url + "&date=" + date.substring(0, date.indexOf(" ")), true);
      xhttp.send();
    }
  }

  function getStates() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        $("#error h3").hide();
        statesResponseData = jQuery.parseJSON(this.responseText);
        states = [];
        for (let state of statesResponseData.states) {
          states.push(state.state_name);
        }
        autocomplete(document.getElementById("selected-location-states"), states);
        getDistricts(lastOpenedState);
      } else {
        $("#error").show();
      }
    };
    xhttp.open("GET", statesURL, true);
    xhttp.send();
  }

  function getDistricts(lastOpenedState) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        $("#error h3").hide();
        districtsResponseData = jQuery.parseJSON(this.responseText);
        districts = [];
        for (let district of districtsResponseData.districts) {
          districts.push(district.district_name);
        }
        if(localStorage.getItem('lastOpenedState') != $("#selected-location-states").val()) {
          $("#selected-location-districts").val(districtsResponseData.districts[0].district_name);
          document.getElementById("selected-location-districts").setAttribute('value', lastOpenedDistrict);
        } else {
          $('html, body').animate({
            scrollTop: $("#last-updated-date-time").offset().top
          }, 1000);
        }
        localStorage.setItem('lastOpenedState', $("#selected-location-states").val());
        localStorage.setItem('lastOpenedDistrict', $("#selected-location-districts").val());
        lastOpenedState = localStorage.getItem('lastOpenedState');
        lastOpenedDistrict = localStorage.getItem('lastOpenedDistrict');
        callApi();
        autocomplete(document.getElementById("selected-location-districts"), districts);
      } else {
        $("#error").show();
      }
    };
    xhttp.open("GET", districtsURL+statesResponseData.states.find((state) => state.state_name === lastOpenedState).state_id, true);
    xhttp.send();
  }

  function populateData(response) {
    let list = [];
    for (let center of response.centers) {
      list.push(center);
    }
    displayInHtml(list);
  }

  function checkForFilters() {
    var doseNumAvailabilityFlag = true;
    var vaccineFlag = true;
    var feesFlag = true;
    var ageFlag = true;

    if (
      $("#filter_dose1_availability").hasClass("selected") ||
      $("#filter_dose2_availability").hasClass("selected")
    )
      doseNumAvailabilityFlag = false;
    if (
      $("#filter_covaxin").hasClass("selected") ||
      $("#filter_covishield").hasClass("selected")
    )
      vaccineFlag = false;
    if (
      $("#filter_free").hasClass("selected") ||
      $("#filter_paid").hasClass("selected")
    )
      feesFlag = false;
    if (
      $("#filter_18plus").hasClass("selected") ||
      $("#filter_45plus").hasClass("selected")
    )
      ageFlag = false;

    if (doseNumAvailabilityFlag && vaccineFlag && feesFlag && ageFlag) return true;

    $(".card").each(function() {
      var doseNumAvailabilityFlag = true;
      var vaccineFlag = true;
      var feesFlag = true;
      var ageFlag = true;
      if ($("#filter_dose1_availability").hasClass("selected")) {
        if ($(this).find('.available-capacity-dose1 span').text() != '0') doseNumAvailabilityFlag = true;
        else doseNumAvailabilityFlag = false;
      }
      if ($("#filter_dose2_availability").hasClass("selected")) {
        if ($(this).find('.available-capacity-dose2 span').text() != '0') doseNumAvailabilityFlag = true;
        else doseNumAvailabilityFlag = false;
      }
      if (
        $("#filter_dose1_availability").hasClass("selected") &&
        $("#filter_dose2_availability").hasClass("selected")
      ) {
        if ($(this).find('.available-capacity-dose1 span').text() != '0' || $(this).find('.available-capacity-dose2 span').text() != '0') doseNumAvailabilityFlag = true;
        else doseNumAvailabilityFlag = false;
      }

      if ($("#filter_covaxin").hasClass("selected")) {
        if ($(this).find('.vaccine span').text() == 'COVAXIN') vaccineFlag = true;
        else vaccineFlag = false;
      }
      if ($("#filter_covishield").hasClass("selected")) {
        if ($(this).find('.vaccine span').text() == 'COVISHIELD') vaccineFlag = true;
        else vaccineFlag = false;
      }
      if (
        $("#filter_covaxin").hasClass("selected") &&
        $("#filter_covishield").hasClass("selected")
      ) {
        if ($(this).find('.vaccine span').text() == 'COVAXIN' || $(this).find('.vaccine span').text() == 'COVISHIELD') vaccineFlag = true;
        else vaccineFlag = false;
      }

      if ($("#filter_18plus").hasClass("selected")) {
        if ($(this).find('.min-age-limit span').text() == '18') ageFlag = true;
        else ageFlag = false;
      }
      if ($("#filter_45plus").hasClass("selected")) {
        if ($(this).find('.min-age-limit span').text() == '45') ageFlag = true;
        else ageFlag = false;
      }
      if (
        $("#filter_18plus").hasClass("selected") &&
        $("#filter_45plus").hasClass("selected")
      ) {
        if ($(this).find('.min-age-limit span').text() == '18' || $(this).find('.min-age-limit span').text() == '45') ageFlag = true;
        else ageFlag = false;
      }

      if ($("#filter_free").hasClass("selected")) {
        if ($(this).find('.fee-type span').text() == 'Free') feesFlag = true;
        else feesFlag = false;
      }
      if ($("#filter_paid").hasClass("selected")) {
        if ($(this).find('.fee-type span').text() == 'Paid') feesFlag = true;
        else feesFlag = false;
      }
      if (
        $("#filter_free").hasClass("selected") &&
        $("#filter_paid").hasClass("selected")
      ) {
        if ($(this).find('.fee-type span').text() == 'Free' || $(this).find('.fee-type span').text() == 'Paid') feesFlag = true;
        else feesFlag = false;
      }

      if(!(doseNumAvailabilityFlag && vaccineFlag && feesFlag && ageFlag)) {
        $(this).remove();
        counter --;
      }
    });
  }

  function checkForCheckBoxes() {
    if($('#viewOnlyAvailable').prop('checked')) {
      $(".card").each(function () {
        if($(this).find('.available-capacity span').text() == '0') {
          $(this).remove();
          counter--;
        }
      });
    }
  }

  function displayInHtml(list) {
    if (list.length == 0) {
      resultContainer.text("NA");
    } else {
      counter = 0;
      var html = "";
      for (let item of list) {
        for (let session of item.sessions) {
          counter++;
          var htmlCard = "<a class='card' href='https://selfregistration.cowin.gov.in/' target='_blank''>";
          htmlCard +=
            "<div class='heading'><div class='name sub-heading'>" +
            item.name +
            "</div>";
          htmlCard +=
            "<div class='sub-heading'><div class='dot'></div></div></div>";
          htmlCard += "<div class='details'>";
          htmlCard += "<div class='location'>Location: ";
          // htmlCard += "<div class='address'>" + item.address + "</div>";
          htmlCard += "<span class='block-name'>" + item.block_name + "</span>, ";
          htmlCard += "<span class='pincode'>" + item.pincode + "</span>";
          // htmlCard +=
          //   "<div class='district-name'>" + item.district_name + "</div>";
          // htmlCard += "<div class='state-name'>" + item.state_name + "</div>";
          htmlCard += "</div>";
          htmlCard += "<div class='date'>Date: <span>" + session.date + "</span></div>";
          htmlCard +=
            "<div class='vaccine'><img src='images/vaccine-icon.png' alt='Vaccine Icon' type='image/png'/><span>" + session.vaccine + "</span></div>";
          htmlCard += "<div class='fee-type'>Fees: <span>"+ item.fee_type + "</span></div>";
          htmlCard +=
            "<div class='min-age-limit'>Age: <span>" +
            session.min_age_limit +
            "</span>+</div>";
          htmlCard +=
            "<div class='available-capacity'>Availability: <span>" +
            session.available_capacity +
            "</span></div>";
          htmlCard +=
            "<div class='available-capacity-dose1'>Dose 1: <span>" +
            session.available_capacity_dose1 +
            "</span></div>";
          htmlCard +=
            "<div class='available-capacity-dose2'>Dose 2: <span>" +
            session.available_capacity_dose2 +
            "</span></div>";
          htmlCard += "</div>";
          if(session.available_capacity > 0) {
            if(session.available_capacity < 15)
              htmlCard += "<div class='book-fast'>Book Fast! Only "+ session.available_capacity+ " available!</div>";
            else
              htmlCard += "<div class='book-fast'>Book Now! "+ session.available_capacity+ " available!</div>";
            htmlCard += "<div class='navigation-link-to-cowin'>GO TO COWIN WEBSITE</div>";
          }
          htmlCard += "</a>";
          html = html + htmlCard;
        }
      }
      resultContainer.html(html);
      checkForFilters();
      checkForCheckBoxes();
      if(apiCalled == 0)
        checkForNotifications();
      apiCalled++;
      $(".card").each(function () {
        if ($(this).find(".available-capacity span").text() == "0")
          $(this).find(".heading .dot").addClass("red");
        else $(this).find(".heading .dot").addClass("green");
      });
      if(counter)
        $("#centers").text(counter + " centers shortlisted.");
      else {
        $("#centers").text("No centers available. Try removing filters.");
      }
    }
  }

  function checkForNotifications() {
    if(isMobile || Notification.permission !== "granted")
      return;
    
    $(".card").each(function () {
      if(!(ndose1 || ndose2 || nage18 || nage45)) {
        return;
      }
      var doseFlag = false;
      var ageFlag = false;

      if($(this).find('.available-capacity span').text() != '0') {
        if(ndose1 && $(this).find('.available-capacity-dose1 span').text() != '0'){
          doseFlag = true;
        }
        if(ndose2 && $(this).find('.available-capacity-dose2 span').text() != '0'){
          doseFlag = true;
        }
        if(nage18 && $(this).find('.min-age-limit span').text() == 18){
          ageFlag = true;
        }
        if(nage45 && $(this).find('.min-age-limit span').text() == 45){
          ageFlag = true;
        }
      }

      if(doseFlag || ageFlag) {
        var options = {
          body:
            "Center: " +
            $(this).find('.name').text() +
            "\n" +
            $(this).find('.block-name').text() + ", " + $(this).find('.pincode').text(),
          vibrate: [500, 250, 500, 250, 500, 250, 500, 250, 500],
        };
        var notification = new Notification(
          "Vaccine Center Available!",
          options
        );
        notification.onclick = function (event) {
          event.preventDefault(); // prevent the browser from focusing the Notification's tab
          window.open(
            "https://covid-19-vaccine-availability.web.app/",
            "_blank"
          );
        };
      }
    });
  }

  function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        //if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].toUpperCase().indexOf(val.toUpperCase()) != -1) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = arr[i].substr(0, arr[i].toUpperCase().indexOf(val.toUpperCase()));
            b.innerHTML += "<strong>" + arr[i].substr(arr[i].toUpperCase().indexOf(val.toUpperCase()), val.length) + "</strong>";
            b.innerHTML += arr[i].substr(arr[i].toUpperCase().indexOf(val.toUpperCase())+val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                inp.setAttribute('value', this.getElementsByTagName("input")[0].value);
                getDistricts($("#selected-location-states").val());
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    inp.addEventListener("focus", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        //if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i]) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML += "<strong>" + arr[i] + "</strong>";
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                inp.setAttribute('value', this.getElementsByTagName("input")[0].value);
                getDistricts($("#selected-location-states").val());
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        if($(e.target).closest(".input-location.autocomplete").length == 0)
          closeAllLists(e.target);
    });
  }
});
