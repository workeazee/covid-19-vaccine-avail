$(document).ready(function () {
  var counter = 0;
  var responseData;
  var resultContainer = $("#result");

  var location = localStorage.getItem('lastOpenedLocation');
  var url = localStorage.getItem('url');
  var viewOnlyAvailable = localStorage.getItem('viewOnlyAvailable');

  if(!location || !url || !viewOnlyAvailable) {
    localStorage.setItem('lastOpenedLocation', locations[0]);
    localStorage.setItem('url', urls[0]);
    localStorage.setItem('viewOnlyAvailable', true);
    location = localStorage.getItem('lastOpenedLocation');
    url = localStorage.getItem('url');
    viewOnlyAvailable = localStorage.getItem('viewOnlyAvailable');
  }
  viewOnlyAvailable = viewOnlyAvailable == 'true' ? true : false;
  $("#viewOnlyAvailable").prop("checked", viewOnlyAvailable);
  autocomplete(document.getElementById("selected-location"), locations);
  $("#selected-location").val(location);
  document.getElementById("selected-location").setAttribute('value', location);

  var notificationsPermissionsDose1 = false;
  var notificationsPermissionsDose2 = false;
  var notificationCount = 0;
  var notificationGivenInOneCall = false;
  // Otherwise, we need to ask the user for permission
  if (
    window.Notification &&
    (Notification.permission !== "denied" ||
      Notification.permission === "default")
  ) {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        notificationsPermissionsDose1 = true;
        notificationsPermissionsDose2 = true;
        $("#notification_enable_disable_dose1").addClass("selected");
        $("#notification_enable_disable_dose2").addClass("selected");
        $("#notification_enable_disable_dose1").text("Disable notifications for dose 1");
        $("#notification_enable_disable_dose2").text("Disable notifications for dose 2");
      } else {
        $("#notification_enable_disable_dose1").removeClass("selected");
        $("#notification_enable_disable_dose2").removeClass("selected");
        $("#notification_enable_disable_dose1").text("Enable notifications for dose 1");
        $("#notification_enable_disable_dose2").text("Enable notifications for dose 2");
      }
    });
  }

  var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    $("#notification_enable_disable_dose1").remove();
    $("#notification_enable_disable_dose2").remove();
  }

  callApi();
  window.setInterval(function () {
    callApi();
  }, 4000);
  window.setInterval(function () {
    notificationCount = 0;
    notificationGivenInOneCall = false;
  }, 60000);

  $("#notification_enable_disable_dose1").on("click", function (e) {
    if ($("#notification_enable_disable_dose1").hasClass("selected")) {
      notificationsPermissionsDose1 = false;
      $("#notification_enable_disable_dose1").removeClass("selected");
      $("#notification_enable_disable_dose1").text("Enable notifications for dose 1");
    } else {
      if (window.Notification && Notification.permission !== "granted") {
        Notification.requestPermission(function (permission) {
          // If the user accepts, let's create a notification
          if (permission === "granted") {
            notificationsPermissionsDose1 = true;
            notificationCount = 0;
            notificationGivenInOneCall = false;
            $("#notification_enable_disable_dose1").addClass("selected");
            $("#notification_enable_disable_dose1").text("Disable notifications for dose 1");
          } else {
            $("#notification_enable_disable_dose1").removeClass("selected");
            $("#notification_enable_disable_dose1").text("Enable notifications for dose 1");
          }
        });
      } else if (window.Notification && Notification.permission === "granted")
        notificationsPermissionsDose1 = true;
        notificationCount = 0;
        notificationGivenInOneCall = false;
      $("#notification_enable_disable_dose1").addClass("selected");
      $("#notification_enable_disable_dose1").text("Disable notifications for dose 1");
    }
  });

  $("#notification_enable_disable_dose2").on("click", function (e) {
    if ($("#notification_enable_disable_dose2").hasClass("selected")) {
      notificationsPermissionsDose2 = false;
      $("#notification_enable_disable_dose2").removeClass("selected");
      $("#notification_enable_disable_dose2").text("Enable notifications for dose 2");
    } else {
      if (window.Notification && Notification.permission !== "granted") {
        Notification.requestPermission(function (permission) {
          // If the user accepts, let's create a notification
          if (permission === "granted") {
            notificationsPermissionsDose2 = true;
            notificationCount = 0;
            notificationGivenInOneCall = false;
            $("#notification_enable_disable_dose2").addClass("selected");
            $("#notification_enable_disable_dose2").text("Disable notifications for dose 2");
          } else {
            $("#notification_enable_disable_dose2").removeClass("selected");
            $("#notification_enable_disable_dose2").text("Enable notifications for dose 2");
          }
        });
      } else if (window.Notification && Notification.permission === "granted")
        notificationsPermissionsDose2 = true;
        notificationCount = 0;
        notificationGivenInOneCall = false;
      $("#notification_enable_disable_dose2").addClass("selected");
      $("#notification_enable_disable_dose2").text("Disable notifications for dose 2");
    }
  });

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
        $("#error").hide();
        var response = jQuery.parseJSON(this.responseText);
        responseData = response;
        populateData(response);
        return response;
      } else {
        $("#error").show();
      }
    };
    url = localStorage.getItem('url');
    xhttp.open("GET", url + date.substring(0, date.indexOf(" ")), true);
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
      if (notificationGivenInOneCall) {
        notificationCount++;
      }
      for (let item of list) {
        checkForNotification(item);
        for (let session of item.sessions) {
          counter++;
          var htmlCard = "<a class='card' href='https://selfregistration.cowin.gov.in/' target='_blank'>";
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
            " +</span></div>";
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
      $(".card").each(function () {
        if ($(this).find(".available-capacity span").text() == "0")
          $(this).find(".heading .dot").addClass("red");
        else $(this).find(".heading .dot").addClass("green");
      });
      checkForFilters();
      checkForCheckBoxes();
      $("#centers").text(counter + " centers shortlisted");
    }
  }

  function checkForNotification(item) {
    var dose1SessionAvailable = item.sessions.find(
      (session) => session.available_capacity_dose1 > 0
    );
    var dose2SessionAvailable = item.sessions.find(
      (session) => session.available_capacity_dose2 > 0
    );
    
    var options = {
      body:
        "Center: " +
        item.name +
        "\n" +
        item.address +
        "," +
        item.block_name +
        "," +
        item.pincode,
      vibrate: [500, 250, 500, 250, 500, 250, 500, 250, 500],
    };

    if (dose1SessionAvailable && notificationsPermissionsDose1) {
      if (notificationCount < 1) {
        notificationGivenInOneCall = true;
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
    }

    if (dose2SessionAvailable && notificationsPermissionsDose2) {
      if (notificationCount < 1) {
        notificationGivenInOneCall = true;
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
    }
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
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                inp.setAttribute('value', this.getElementsByTagName("input")[0].value);
                $('html, body').animate({
                    scrollTop: $("#last-updated-date-time").offset().top
                }, 1000);
                localStorage.setItem('lastOpenedLocation', this.getElementsByTagName("input")[0].value);
                localStorage.setItem('url', urls[locations.indexOf(this.getElementsByTagName("input")[0].value)]);
                callApi();
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
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                inp.setAttribute('value', this.getElementsByTagName("input")[0].value);
                $('html, body').animate({
                    scrollTop: $("#last-updated-date-time").offset().top
                }, 1000);
                localStorage.setItem('lastOpenedLocation', this.getElementsByTagName("input")[0].value);
                localStorage.setItem('url', urls[locations.indexOf(this.getElementsByTagName("input")[0].value)]);
                callApi();
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
        closeAllLists(e.target);
    });
  }
});
