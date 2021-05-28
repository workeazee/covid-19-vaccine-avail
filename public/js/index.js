$(document).ready(function () {
  var responseData;
  var resultContainer = $("#result");

  var location = localStorage.getItem('lastOpenedLocation');
  var url = localStorage.getItem('url');

  if(!location || !url) {
    localStorage.setItem('lastOpenedLocation', locations[0]);
    localStorage.setItem('url', urls[0]);
    location = localStorage.getItem('lastOpenedLocation');
    url = localStorage.getItem('url');
  }
  $("#selected-location").val(location);
  $("#selected-location")
    .autocomplete({
      source: locations,
      minLength: 0,
      select: function(event, ui) {
        $('html, body').animate({
          scrollTop: $("#last-updated-date-time").offset().top
        }, 1000);
        localStorage.setItem('lastOpenedLocation', ui.item.value);
        localStorage.setItem('url', urls[locations.indexOf(ui.item.value)]);
        location = localStorage.getItem('lastOpenedLocation');
        url = localStorage.getItem('url');
        $("#selected-location").val(location);
        callApi();
      }
    })
    .focus(function (event, ui) {
      $(this).autocomplete("search", '');
    });

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

    var counter = 0;
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
      }
      else counter++;
    });
    $("#centers").text(counter + " centers shortlisted");
  }

  function displayInHtml(list) {
    if (list.length == 0) {
      resultContainer.text("NA");
    } else {
      var counter = 0;
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
          htmlCard += "<div class='block-name'>" + item.block_name + "</div>";
          htmlCard += "<div class='pincode'>" + item.pincode + "</div>";
          // htmlCard +=
          //   "<div class='district-name'>" + item.district_name + "</div>";
          // htmlCard += "<div class='state-name'>" + item.state_name + "</div>";
          htmlCard += "</div>";
          htmlCard += "<div class='date'>Date: <span>" + session.date + "</span></div>";
          htmlCard +=
            "<div class='vaccine'>Vaccine: <span>" + session.vaccine + "</span></div>";
          htmlCard += "<div class='fee-type'>Fees: <span>"+ item.fee_type + "</span></div>";
          htmlCard +=
            "<div class='min-age-limit'>Minimum Age Limit: <span>" +
            session.min_age_limit +
            "</span></div>";
          htmlCard +=
            "<div class='available-capacity'>Availability: <span>" +
            session.available_capacity +
            "</span></div>";
          htmlCard +=
            "<div class='available-capacity-dose1'>Dose 1 Availability: <span>" +
            session.available_capacity_dose1 +
            "</span></div>";
          htmlCard +=
            "<div class='available-capacity-dose2'>Dose 2 Availability: <span>" +
            session.available_capacity_dose2 +
            "</span></div>";
          htmlCard += "</div>";
          if(session.available_capacity > 0) {
            if(session.available_capacity < 10)
              htmlCard += "<div class='book-fast'>Book Fast! Less than 10 available!</div>";
            else
              htmlCard += "<div class='book-fast'>Only "+ session.available_capacity+ " available!</div>";
            htmlCard += "<div class='navigation-link-to-cowin'>GO TO COWIN WEBSITE</div>";
          }
          htmlCard += "</a>";
          html = html + htmlCard;
        }
      }
      resultContainer.html(html);
      $("#centers").text(counter + " centers shortlisted");
      $(".card").each(function () {
        if ($(this).find(".available-capacity span").text() == "0")
          $(this).find(".heading .dot").addClass("red");
        else $(this).find(".heading .dot").addClass("green");
      });
      checkForFilters();
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
});
